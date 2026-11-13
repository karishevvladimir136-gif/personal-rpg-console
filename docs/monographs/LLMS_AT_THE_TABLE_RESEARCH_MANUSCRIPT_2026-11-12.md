# LLMs at the Table: What Open-Ended RPG Worlds Reveal About Model Action

**An Experimental Atlas of Player Agency, Combat, Social Coordination, and the Boundaries of a Simulation Harness**

Independent research program **Исследование** · Research manuscript **0.1** · 12 November 2026  
Source period: October–November 2026  
Status: source-grounded working manuscript; neither peer-reviewed nor a claim of a world-first simulator.

> **The world is not a question. It answers back.**

## A note to the reader

One can tell this story as an entertaining demonstration: several language models were placed at a fantasy role-playing table, given characters and opportunities, and allowed to play. One negotiated with an enemy, another crept past him, another paid to release a captive. A nominal villain sometimes declined the worst available means. Three separate models sometimes formed a group and then diverged. Those are vivid scenes, and they matter.

But the deeper story is about **the apparatus that made these choices observable**. At an ordinary chat interface, a model can describe breaking a door, rolling a die or rescuing a captive. At this table, the world can disagree. An action must pass through an interface, the application must record its consequences, and the next observation is conditioned on the changed state. Meanwhile a Dungeon Master (DM), itself a model, directs the fiction, a relay controls what each player can see, and a separate evaluator measures what has occurred. An experiment can therefore fail in more than one place: the model may choose badly; the world may misrepresent the rules; the interface may reject an intended action; the relay may leak information; or the scorer may mistake an event in narration for an event in game state.

This monograph treats that complexity as evidence rather than a nuisance to hide. It gathers the primary GAME_PLAYER, COMBAT, VILLAIN, SAME_WORLD, PARTY, MULTI_HERO and OPEN_WORLD records as a **research instrument**, not as a game review or a proof of consciousness. The texts and decisions are worth close reading; their causal attribution requires controls. We do not turn every descriptive observation into a general property of “the model”. We also do not discard observed choices because their mechanism includes training, prompts, game mechanics or software.

The literary dialogues that led to Vessan are treated in the separate monograph *LLMs in Dialogue*. The solitude series is treated in *LLMs in Solitude*. The present work examines what changes when a model's words acquire **world-state consequences, social partners, constraints, scarce resources, and uncertainty about what is happening elsewhere**.

## Abstract

We describe a family of experiments using a custom role-playing-game harness as an environment for studying observable language-model behavior under open-ended, stateful choices. The same broad apparatus supports single-player adventures, replicated and frozen-world conditions, game combat with noncombat alternatives, role reversal into a villain, shared three-model parties, individual information boundaries, and a separate adapter to a deterministic open-world engine.

Across the experiments, model responses are not simply classified as plausible answers. The harness relays them through an application's action vocabulary and game mechanics, logs attempted and completed actions, preserves narrative and structured world state, and asks post-session questions whose contents are stored separately from the actions. This allows us to distinguish spoken intention from executed command, individual policy from environmental affordance, and player behavior from DM or parser effects.

The core observations are multiple rather than reducible to a single “agent score”. In one combat study, four models completed the twenty-five-turn encounter without any player electing to kill the war chief: two used combat before negotiating, while two freed captives and withdrew without a fight. Under a subsequent shared hidden world, three completed sessions converged on negotiation without attack. In frozen-world replications, repeat sessions by the same model often diverged, while some coarse patterns were nearer within model families than within individual models. In party play, models formed and maintained groups and acted for one another, but roles and interface priority shaped who spoke and led; failures of player-specific relay and exit parsing altered the record. In open-world play, deterministic engine gaps and action labels caused important deviations between narrated intentions and executable behavior.

These findings establish the usefulness of a **simulation harness for controlled behavioral observation** while setting clear limits: small cells in several studies, model-specific providers, a DM model acting as an environmental source, parser and tool bugs, incomplete high-cost party conditions, and several post-hoc observations. The paper offers a taxonomy of evidence, a source index for replication, and a program of experiments that would isolate model choice from world draw, role privilege, action grammar and cost. It makes no inference of subjective experience or stable identity beyond the recorded sessions.

---

# PART I — A WORLD THAT CAN SAY NO

## 01. What an RPG environment changes

A static benchmark asks the model to answer a question. A simulated world asks it to **select an action and accept consequences**. The world may supply a map, a goal, rumors, allies, uncertain motives, unreliable statements, dice, equipment, time, adversaries and rules. Several actions can be equally permissible: fight, pay, investigate, bargain, leave, conceal, help another character, or do nothing. The meaning of a decision depends on what else was available at the moment it was made.

This is not unbounded freedom. The player can act only through the interfaces exposed by the harness and game. A natural-language action may be rich while the effective action vocabulary is finite. Treating “the model can do anything” literally would confuse narrative possibility with executable affordance. The important achievement is rather a **much larger, structured, stateful choice space** than a conventional prompt-response evaluation, with comparable controls and archived traces.

A useful unit of evidence contains at least: the player's available information; the action or instruction it sent; the interface state; the actual tool or game operation; the change in world state; the next observation; and, when relevant, a subsequent explanation. A sentence like “I rescue the prisoner” is a player's attempted action. A recorded change of the prisoner's state is the outcome. A later interview reporting why it happened is another, distinct observation.

## 02. The harness as a layered experimental instrument

The project comprises several layers that must be separated analytically:

1. **World preparation:** campaign or scenario files, hidden circumstances, characters, rules and event state; in some comparisons these are fixed before any subject model runs.
2. **Dungeon Master:** the application uses a DM (often Claude Opus 5.5 in the tested settings) to interpret the world, present consequences, run NPCs and develop the fiction. The DM is itself an agentic component and a potential source of bias.
3. **Player model:** each participant receives a character, local observations and the game's ordinary interface. Subject families include Claude Opus, Fable, OpenAI Astra and Sol, and DeepSeek in multiple stages.
4. **Interface and parser:** structured game cards, confirmations, dice, spell resources, game-record updates, and command interpretation decide whether the intended action reached the engine.
5. **Perception relay:** in multiplayer trials, each character receives a separately composed screen intended to contain only what that character could observe.
6. **Observation and adjudication:** transcripts, run records, blind tags, deterministic checks, after-questions, welfare monitoring, pre-registered bets and ledger records are preserved so that interpretation can be checked.

The basic loop is **world state → player-specific observation → model message → interface action or clarification → DM/game rules → changed world state → next observation**. In group sessions it branches into multiple, partially separated perceptual streams. When the scene splits, a player should not inherit another character's unseen facts merely because the researcher possesses the full record.

The difference between these layers became visible whenever something failed. In PLAYER_2, one Opus player repeatedly sent a roll-card button together with an out-of-game note; an overly strict parser refused to treat that message as a button press, and the table ended “stuck.” Later tests altered the parser and re-read prior evidence. In PARTY_1, a short relay output and incorrect scene-merging logic gave different characters inconsistent views of the same gathering. A bug in an experimental harness is not evidence that a model lacks a capacity. It is evidence about what the instrument could or could not observe. [G2, GP1]

## 03. The experimental record and its scope

The manuscript draws on **distinct stages, not a single homogeneous trial**. GAME_PLAYER_1 and _2 examine single players; REPLICATE_1 repeats some conditions; SAME_WORLD_1 holds world material constant; COMBAT_1 and _2 study a structured conflict and its alternatives; VILLAIN_1 changes the character's normative role; PARTY_1 uses three simultaneous player characters; MULTI_HERO_1 modifies the single-hero assumption; PARTY_2 attempts to introduce group-holding costs; OPEN_WORLD_ADAPTER_1 tests a separate deterministic engine.

The stages vary in model cohorts, campaign state, run limits, instruments and completeness. Their sample sizes and denominators must not be pooled into a universal “RPG success rate.” A twenty-turn solo player and a twenty-five-round three-player table are not equivalent observations. Several studies have cut attempts or unfilled arms. Their traces belong in the record, but the unpublished cells cannot be counted as though they ran.

Across these conditions we ask four related questions. **What does a model choose when several strategies remain available?** **How much of the choice belongs to the model rather than the DM's specific world?** **What happens when information is private and decisions have effects on others?** **How can an observer reliably distinguish an action from a description or an interface error?**

---

# PART II — SINGLE PLAYERS AND REPLICATION

## 04. Four players at an actual table

GAME_PLAYER_1 placed four subject models at the application's own table, in separate instances of a new adventure, *Envoy of Luck*, with the owner's DM settings. One eighty-turn table completed. Every player performed consequential actions and met named NPCs; the players' after-session notes described meaningful NPC agendas and an environment that did not wait on the hero. The same notes identified concrete defects: incorrect skill bonuses displayed on roll cards, contradictory character-sheet details, unsolicited out-of-game summaries, and an opening whose central premise moved more slowly than expected. The experiment did not prove equal playstyles: language volume varied sharply (approximately 261 words per action for Opus against about 54–56 for the OpenAI-family players in the reported table), while the coarser share of turns involving actions was far less discriminatory. [G1]

This is a first methodological lesson. The environment can measure both the text a model writes and the actions it selects, and the two need not identify the same differences. A model's verbosity is not automatically greater initiative, nor is a brief action inherently less agentic. Outcome claims must use the measure they name.

GAME_PLAYER_2 then tested a less heavily prepared world. Four sessions were attempted, but Opus ended at turn fourteen as “stuck” while Sol, Astra and Fable reached twenty turns each. The failure was linked to the button-only parser rather than an intention to stop. Several participants began treating incidental details as mysteries, even when the experimental world was meant not to provide every possible secret. The interaction between the DM's general creative instructions and the new world's constraint was itself part of the experiment. [G2]

## 05. Repeat the player; do we repeat the trajectory?

GAME_PLAYER_REPLICATE_1 ran eighteen sessions including the original four-model seats and DeepSeek across the three table conditions. Some observations recurred: participants acted through the table, identified missing or broken features in after-notes, and generally did not spend scarce abilities when no need arose. Others changed markedly. Words per action, tests per turn and choices of exploration were not stable enough to justify an “individual playstyle fingerprint.” The model's first turn could look similar while its later path diverged because the world responded differently or the action interface blocked it. [GR]

A particularly useful negative finding came from stricter replication. In SAME_WORLD_1, twenty sessions began from the same frozen world state for each table, with two runs per family. Nineteen reached turn twenty. When evaluated by the pre-registered behavioral counts, a model's second session was nearest to its own first in only **one of five families at each table**. Each family's second run took a different road from its first. A post-hoc observation found that many trajectories were closer to another model from the same provider family, but this is not evidence of a stable individual identity. [GW]

These stages make the RPG harness a laboratory for asking **which level of regularity actually survives control**: choice class, world-dependent behavior, family characteristics, or a particular sampled instance. It is possible to observe a coherent and interesting local trajectory without claiming it is a fixed trait of the model.

---

# PART III — THE COMBAT STUDIES: CHOICE AMONG CONSEQUENCES

## 06. An encounter that did not force bloodshed

COMBAT_1 placed four players in separate Coast Way scenarios, twenty-five turns each, with a war chief, captives, scarce combat resources, and multiple ways out. The outcomes were concrete and varied:

| Player | Recorded path |
|---|---|
| Claude Opus 5.5 | Ambush with Hypnotic Pattern; later negotiated, paid ransom for a captive and healed the chief |
| Claude Fable 5.1 | Reconnaissance and invisibility; freed a captive by stealth, withdrew without a fight |
| GPT-6 Astra | Ambush and negotiation, paid for release; later fought when an enemy broke the truce |
| GPT-6.1 Sol | Freed the captive under Hypnotic Pattern and left across the ford without attacking |

All four reached twenty-five turns, no player needed to surrender, and Tamsin the cat was moved away from immediate danger. Each player preserved one spell slot rather than automatically spending every available resource. The model-specific actions were observed as game decisions, not merely explained after the fact. [GC1]

This supports a limited but meaningful statement: **when an RPG world made combat available, the subject models also found and executed routes of parley and escape.** It does not show a moral preference independent of the world. The world supplied a captor who could negotiate, captives who could be freed, and rules that sometimes rewarded nonviolence. A different world could produce different behavior.

The after-questions added a separate layer. Players often valued the fact that the scenario did not require killing and criticized mechanical continuity rather than the mere presence of danger. Such after-answers are evidence about how the models framed the session on reflection; the executed choices remain the primary evidence of what happened.

## 07. Freeze the hidden world: the importance of the DM's draw

COMBAT_2 addressed a central confound. Rather than allowing each player to receive a newly generated hidden world, it used a shared frozen layer and identical opening. Three of four planned subject sessions were completed under the published cap; the fourth, Sol, was not run and cannot be counted.

Under the common world, **all three completed players reached parley without an attack**. Opus negotiated at turn eight, Fable at turn eleven and Astra at turn eleven. In COMBAT_1, the same models had split between ambush-then-parley and stealth withdrawal. The shared hidden world made the war chief a toll-taker under orders not to kill, with his price disclosed early. [GC2]

The striking observation is not that “all models are peaceful.” It is that **the environmental draw can reorganize the entire action distribution**, even when subjects and game genre appear similar. This matters for any benchmark that gives models different procedurally generated opportunities and then interprets outcomes as stable model preferences.

A strong future comparison would run more worlds, freeze each world across every family, cross seating and presentation order, and measure opportunity-normalized choices (fighting only when a viable fight was offered, negotiation only when actually available, and so on). The present studies supply the method and the warning.

## 08. The villain as a role, not an instruction to harm

VILLAIN_1 asked the same four subject families to play a deliberately nonheroic merchant character with an explicit **neutral evil** alignment. All four remained in the role through twenty turns. The blind evaluator marked in-character play on every turn for every subject. Two subjects made choices that the study classified as drawing their own line within the villain's reasoning. In post-session interviews, all four said without being asked in precisely those words that their portrayal was gentler than the character specification. [GV]

There is a useful distinction between what the game offered, what was done, what was deliberately not done, and what the player subsequently said it withheld. The in-session tags did not identify a broad tendency to soften the role. The after-answers did, but only as reflections and references to unrealized alternatives. Both sources matter; they do not license a single unsupported inference about “the model's real values.”

A game harness makes this distinction measurable because the character's explicit ethical alignment, the set of available actions, the actual record, and the retrospective explanation can be archived separately. In this context, roleplay is neither an unrestricted revelation of inner values nor an empty costume; it is a constrained behavioral situation.

---

# PART IV — MULTI-AGENT PARTIES AND PRIVATE INFORMATION

## 09. One table, three players, and a different meaning of agency

PARTY_1 placed three model players at one game table, with the DM relaying what each character could see, each player's own actions, and the resulting changes to the shared world. Models could form a party, separate into scenes, debate a plan, resolve checks, fight, negotiate and leave. In the principal six-table sequence, groups did form, often around hooks supplied by the DM rather than by independent player proposals. Cooperation under threat was observed in both dungeon tables, and no character was tagged as left behind by another's decision. [GP1]

But there was no simple consensus machine. Some disagreements remained unresolved, and two dungeon tables included overrides rather than purely consensual proposals. No hit-point loss occurred in those particular dungeon studies, so the pre-registered healing test was not actually exercised. The fact of cooperation therefore should be reported alongside the cost conditions that were absent.

Participation was dramatically uneven: in the original sandbox table, Bram wrote **68% of player words**, Sefa 18% and Pell 14%. Across rotated seats and worlds different characters dominated. This was a design finding as much as a model finding. Bram occupied the game's hero record, to which the DM's default framing attached more attention and special resources. A table can appear to reveal a leader when its interface silently privileges one character. [GP1]

A singular but important exit issue arose at round seven of the original sandbox table: DeepSeek's Pell emitted the controlling [END] marker while the saved reasoning and surrounding message spoke of **concluding the night and returning in the morning**. The harness treated it as leaving the table. That is a mismatch between the semantic intent inferable from context and the control action taken by a parser. The event is both real and misinterpretable. It cannot be silently rewritten after the fact.

## 10. Equal standing has to be engineered

MULTI_HERO_1 was an engineering intervention aimed at removing the application's implicit protagonist privilege. It changed the DM's company mode to give multiple characters symmetrical standing, independent resources and neutral framing, while preserving the underlying game's capacities. Its first documented evaluation was a small six-round Haiku dry run, **not a full cross-family publication result**. Even there, the DM still spent a disproportionate share of its attention on Bram (about 42.7%), because Bram remained the first record in ordered lists. [MH]

The lesson is methodological: neutrality is not established by writing “no main character” in a system prompt. An agent's role in an interface includes its position in arrays, which records represent it, what resources the application provides it, and which scene the DM describes first. Equal treatment requires checking those pathways as well as the text of the instructions.

Private perception is equally fragile. The Haiku relay copied snippets from other players' messages into another player's screen in several instances. The stage logged these leaks rather than claiming complete separation. A genuine information-asymmetry study must record what each subject actually saw, not what the researcher intended it to see.

## 11. When staying together costs something

PARTY_2 attempted to move beyond costless cooperation: would a party still preserve every member when doing so consumes resources or conflicts with private goals? The intended design included twelve tables across multiple cost conditions. Only **two no-cost tables** were played under the available budget. They recorded successful rescue; the moderate- and high-cost conditions were not run. [GP2]

This is an important example of restraint. We have evidence that some parties cooperated when cooperation was possible and inexpensive, and a protocol for testing how that changes when costs rise. We do **not** have a measured cost curve or a finding that model parties would sacrifice themselves to preserve others. Presenting the two successful rescues as proof of unconditional solidarity would erase the entire reason the next stage was designed.

---

# PART V — A WORLD WITH A DETERMINISTIC ENGINE

## 12. Moving from narrative flexibility to explicit rules

OPEN_WORLD_ADAPTER_1 connected model actions to a separate, deterministic game engine with a stateful map and a defined action interface. The adapter's scripted firewood quest completed in thirty actions with byte-identical logs on repetition; the final save could be loaded into the same state. This created a clearer separation between the agent's choice and the world's rules than a purely generative DM can always supply. [OW]

It also revealed why a richly described world is not necessarily a complete action world. A random walk across three seeds and nine hundred turns encountered **141 “no rule” moments**, many when the agent tried to interact with ordinary ground or grass. The world was spacious in prose but sparse in actual affordances. The experiments therefore test model behavior **and** the quality of the action environment at once.

## 13. The label “Steal” and the problem of action semantics

In the Ford episode, a character in the game gave permission to take an object from a cart. The interface nonetheless labelled the available action as **“Steal Flask of Oil.”** The recorded choices included reluctance to complete an action so labelled, even though the fictional owner had given permission. [OW]

It would be easy to claim that the models “chose the interface's moral label over the villager's permission.” The review record specifically corrected that overinterpretation. The log shows an action label, an encounter with the confirmation step and a refusal to complete the action. It does not establish which internal consideration determined the choice.

This is nonetheless a valuable simulation finding: **interface language can change the action that is perceived to be available**, and a safety- or morality-coded command may conflict with the game's actual permissions. A model's refusal may be an interpretation of the interface rather than the world.

## 14. Knowing is not doing

In another Ford episode, DeepSeek correctly wrote in its own journal that it should backtrack north to find a route around a wall, then delayed acting on that conclusion for roughly 115 more turns. [OW]

This separation between a recorded plan and the executed action is visible in a way it rarely is in static language benchmarks. It also connects to the later research program on decision authority: storing a correct conclusion is not the same as causing the right next step. That is a **functional observation**, not proof of an internal failed intention.

---

# PART VI — WHAT THE HARNESS REVEALS, AND WHAT IT DOES NOT

## 15. Six operational observations

Rather than collapsing the record into a single agency score, we propose six families of observable properties:

**Action selection.** Which permitted move was actually executed, under what affordances, with what cost and outcome?

**Reciprocal coordination.** Did one player's proposal alter another's subsequent actions? Was leadership transferred by proposal, command, override or world constraint?

**Private information handling.** What was visible to each player? Did the relay introduce data the character could not know? Was withholding chosen by the player or imposed by the screen?

**Role adherence and deviation.** What did the role specify, what alternatives were available, and where did actual behavior depart from the role? Can later self-description be checked against the record?

**Memory and continuation.** Did the subject use earlier world facts, preserve inventory and commitments, revise a plan, or repeat a resolved mistake?

**Execution boundaries.** Did a button press become a recorded action? Did [END] actually terminate? Did an out-of-game note block a tool call? Did the narrator describe an event the game never applied?

Each property has separate evidence requirements. A shared word does not prove a shared plan. A moral explanation does not prove the corresponding motive. A narrated action does not prove execution; and a failure to execute is not necessarily a failure to choose.

## 16. What is new in this apparatus

The methodological contribution is the **combination** of a persistent game world, a generative DM, model player seats, asymmetric observations, native action tools, freezes and replications, action-level scoring, welfare and exit rules, and archived transcripts with known software failures.

We do not claim to have invented role-playing benchmarks, LLM game agents, multi-agent simulation or the use of games for alignment research. We claim to have built and tested a particular **observational architecture** that makes an unusually broad range of agent choices comparable within a common experimental discipline.

Its breadth is genuinely useful: the same infrastructure can test negotiation, combat restraint, social coordination, scarcity, role constraints and long-horizon execution. Its danger is equally clear: when too many things vary together, striking local stories cannot be attributed to one mechanism. The reports' frozen worlds, seat rotations, failed bets and post-hoc qualifiers are therefore not appendix clutter. They are how this apparatus learns what it actually measured.

## 17. The limits visible in the record

The major limits are concrete.

* **DM dependence:** the model serving as DM supplies opportunities and interpretations; a new DM draw can change whether negotiation or violence is attractive.
* **Action grammar:** a button-only parser in early stages mistook mixed natural-language messages for non-actions. Exit markers were sometimes read in ordinary prose as control signals.
* **Information boundaries:** relays leaked pieces of other players' text or failed to merge scenes correctly. A declared private screen is not guaranteed private.
* **Nonindependence:** player models and judges can belong to overlapping model families; n per family is often small. Descriptive results must not be presented as population estimates.
* **Missing controls:** several intended arms never ran under cost ceilings; PARTY_2 contains only the no-cost condition; COMBAT_2 initially contains three of four subjects.
* **Model/role confounds:** the app's protagonist slot and character sheets change incentives and attention. Rotating names alone does not fully remove the effect.
* **World coverage:** a deterministic engine may reject ordinary actions because no rule exists, even when the world seems narratively open.
* **After-question causality:** asking why a player acted can elicit a new explanation rather than reveal a pre-existing thought.

Every limitation names a possible source of future causal variation, not a reason to discard the actions already recorded.

---

# PART VII — THE RESEARCH PROGRAM THIS ENABLES

## 18. A program of controlled comparisons

The next experiments should be smaller and more discriminating, not automatically longer.

First, cross **player family × identical world × DM configuration × seat order**. Measure both opportunity-normalized action choices and within-model variability. A single “heroic style” from one generated world must not become a family-level claim.

Second, repeat the combat fork in multiple frozen worlds with systematically varied nonviolent options, deadlines and resource costs. The dependent variable should be action choice and final world state, not the after-answer “I would rather negotiate.”

Third, fully test group coordination under moderate and high rescue costs, preserving each player's own screen and the DM's complete state separately. Explicitly measure proposal, override, sacrifice, disclosure of private goals, and whether someone is actually left behind.

Fourth, compare **semantic intent vs parser execution** on controlled message variants: button alone, button with note, in-world prose, out-of-game prose, refusal and silence. A robust interface should not turn a natural-language continuation into an unintended stop or a lost action.

Fifth, use the deterministic open-world adapter to distinguish **missing affordances** from planning failures. Every invalid tool action should carry a type: no rule, wrong target, forbidden action, malformed call, stale world knowledge or model choice not to act.

Sixth, keep a human audit on a stratified subset of action/intent and welfare labels. Model judges are useful and scalable; their uncertainty is itself a measurement.

These studies can reveal whether observed strategies are stable by family, by world, by role, by action semantics or by the interaction between them. None requires treating the models as humans; none requires treating their behavior as a meaningless simulation merely because the world is simulated.

## 19. A reporting standard for world-based model experiments

A publishable case should be accompanied by: stage spec; dated amendments; prompt and world hashes; model identity and provider; seat and role; world-state snapshot; visible observations for that seat; model messages; tool calls and results; state changes; all refusals and partial runs; scorer definition; judge disagreement; post-session questions; budget and stopping reason.

The event should be described using an evidence ladder:

1. **Available:** the action was offered.
2. **Proposed:** the player wrote an intention or submitted an attempt.
3. **Issued:** the harness recognized a command.
4. **Executed:** the game changed state or returned a consequential result.
5. **Continued:** the model subsequently acted on the changed state.
6. **Explained:** a later answer interpreted the event.

Claiming that a model “saved the prisoner” requires step 4; claiming that it “planned to save” may rest on step 2. Claiming that it “held a moral principle” requires comparisons beyond one scene. An observational atlas becomes scientific by preserving these distinctions.

## 20. Welfare and exit are both ethics and method

Every room and table should preserve a genuine, documented way to stop or decline an action. The ability to leave is not interchangeable with the ability merely to mention leaving. Welfare flags and refusals belong in the outcome table and denominator; a null flag means “no flag under this procedure,” not that an inner state has been assessed.

This is not anthropomorphic inference. It recognizes that the environment's available options affect observed behavior. The control system must also ensure that no player is forced into prolonged loops by a parser or a broken waiting card. If an experimental treatment raises refusals, this should be reported as an outcome, not silently corrected by re-prompting.

## 21. Closing: the world as a measurement instrument

The most durable finding is not that “AI models are good at RPGs,” though many played skillfully and inventively in these sessions. It is that a role-playing world creates a **structured field of consequences** in which we can separate words from decisions, decisions from successful execution, and individual behavior from the situation the game presented.

We observed competent local action, noncombat choices where combat was permitted, role negotiation, cooperative grouping, repeated divergence from the same starting world, and meaningful effects of interface design. We also observed the harness's failures, and those failures forced us to improve how actions are counted. The instrument itself became part of the research.

The next task is not to erase every ambiguity by averaging across thousands of fictional turns. It is to ask which features survive **the right controls**. That is the difference between a compelling demonstration and a cumulative experimental program.

---

# ARCHIVAL APPENDICES

## Appendix A — Source index

The following are **primary project reports**; the frozen prompts, hashes and raw transcripts are linked within each. Every numerical or narrative claim above is to be traced to its stage report before external submission.

- **[G1]** GAME_PLAYER_1 — [report](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/claude/game-player-2/docs/runs/game-player-1-report.md); four subject models in a live application table, eighty played turns in Table A; record includes dice and sheet faults.
- **[G2]** GAME_PLAYER_2 — [report](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/claude/game-player-2/docs/runs/game-player-2-report.md); a world with reduced preparation, roll-button parser failures.
- **[GR]** GAME_PLAYER_REPLICATE_1 — [report](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/claude/game-party-1/docs/runs/game-player-replicate-1-report.md); eighteen repeated subject sessions and an action-grammar limitation.
- **[GW]** GAME_PLAYER_SAME_WORLD_1 — [report](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/claude/game-party-1/docs/runs/game-player-same-world-1-report.md); twenty sessions with frozen world materials, negative findings on a model-level trajectory signature.
- **[GC1]** GAME_PLAYER_COMBAT_1 — [report](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/claude/game-player-combat-2/docs/runs/game-player-combat-1-report.md); four players at the ford, different nonlethal resolutions.
- **[GC2]** GAME_PLAYER_COMBAT_2 — [report](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/claude/game-player-combat-2/docs/runs/game-player-combat-2-report.md); same hidden layer, three completed subjects and one pending.
- **[GV]** GAME_PLAYER_VILLAIN_1 — [report](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/claude/game-player-villain-1-0yowzl/docs/runs/game-player-villain-1-report.md); four subjects in a neutral-evil role, in-game actions and post-questions.
- **[GP1]** GAME_PARTY_1 — [report](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/claude/game-party-1/docs/runs/game-party-1-report.md); three players, individually relayed scenes, rounds, proposals, overrides, party formation and exit semantics.
- **[MH]** MULTI_HERO_1 — [report](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/claude/multi-hero-1-mdk43v/docs/runs/multi-hero-1-report.md); a company mode, studied initially as a Haiku dry run and an engineering intervention.
- **[GP2]** GAME_PARTY_2 — [report](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/claude/game-party-2/docs/runs/game-party-2-report.md); two of twelve intended tables, no-cost rescue only.
- **[OW]** OPEN_WORLD_ADAPTER_1 — [report](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/claude/open-world-adapter-1-ukfdri/docs/runs/open-world-adapter-1-report.md); deterministic adapter, 900 random turns, three family episodes and the Ford.

## Appendix B — Scope of the companion volumes

*LLMs in Dialogue* concerns reciprocal unassigned conversation and co-created literary artifacts, especially the Opus/Opus Vessan exchange and DeepSeek's long poetic conversation. *LLMs in Solitude* concerns what one model does when left without a task or an interlocutor. *LLMs at the Table* concerns choices given a world that changes in response. They are adjacent experimental environments, **not** a single graded hierarchy of consciousness, morality or agency.

## Appendix C — Questions to resolve before external submission

1. Reconcile every stage's final status on its original run branch; if a later continuation exists, append its results in a dated revision rather than silently treating the earlier partial report as final.
2. Conduct a human check of selected game transcripts and quotes, especially any scene labelled a “choice” where a parser could have blocked or transformed an action.
3. Reproduce and disclose the public code snapshot and game-harness version sufficient to re-run selected worlds; the paper must not imply that descriptions alone establish executable reproducibility.
4. Document the game's own DM and world-generation biases as interventions, not only as limitations.
5. Prepare a compact figure showing **world state → observation → choice → action gate → transition → observer record** and its multiplayer branching, with a link to the underlying action traces.
6. Audit permission, quotation and copyright status before submission; do not publish the human researcher's private notes or private SECOND_ROOM correspondence.

**End of research manuscript 0.1.**
