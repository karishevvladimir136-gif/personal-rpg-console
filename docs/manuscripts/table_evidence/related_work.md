## 55. Where this apparatus sits among earlier work

The contribution of an experimental apparatus becomes clearer when its neighbours are described precisely. A model can be a player, a narrator, a game engine, an assistant to a human DM, or one inhabitant of a simulated society. Those roles expose different capabilities and assign authority to different parts of the system. Calling all of them “LLMs playing games” obscures the comparison that matters.

This chapter places the Table corpus alongside fourteen primary research works. The selection follows four questions: who acts, what makes an action take effect, how information is distributed, and what the evaluation measures. It covers text-game environments, generative social simulation, RPG engines and combat, and assistance around human play. It is a targeted related-work review, with a documented search and access record, rather than an exhaustive systematic review. The comparisons below are this monograph's analysis of the cited designs; they are not results of running those systems against our harness.

### Text worlds and the difference between knowing and doing

**TextWorld** provides a configurable environment for text-game interaction, including game generation, state tracking and rewards. Its control over game properties supports studies of generalization across related worlds. It establishes a substantial precedent for making language-mediated action experimentally tractable. [E05]

**ScienceWorld** makes a complementary distinction: answering a science question and carrying out an experiment in an interactive environment are different demands. Its elementary-science tasks require agents to manipulate an environment to achieve a scientific objective. [E06]

These precedents help identify the role of the formal-engine episodes in this book. The engine supplies a transition that prose alone cannot guarantee. When the player selects an action, the next observation can reveal that it succeeded, failed, or had no applicable rule. The axe-return sequence is valuable precisely because both an explicit intention and an unsuccessful transfer are retained. The scientific object includes the relation between them.

**BALROG** extends game-based evaluation across several established environments and levels of difficulty, including demanding exploration and planning settings. Its published evaluation distinguishes performance across games and observation modalities. [E03]

The Table corpus has a different evaluation structure. It does not supply a common score across its solo campaigns, party tables and OpenWorld episodes. Instead, it follows the choices that occur inside each configuration and tests some early interpretations through repetition or changed controls. A navigational failure and an optional attempt to return borrowed equipment can coexist in one run. Collapsing them into a single successful-or-unsuccessful label would discard information this book was built to preserve.

### Open-ended activity still has an architecture

**Voyager** studies extended exploration in Minecraft using an automatic curriculum, a growing library of executable skills, and feedback-based programme revision. The system can accumulate reusable behaviours through interaction without fine-tuning the underlying model's parameters. [E07]

**Generative Agents** places twenty-five agents in a small-town sandbox, using memory, reflection and planning to organize individual activity and social interaction. Its evaluation examines the believability of the resulting behaviour and the contribution of architectural components. [E01]

Both are useful neighbours because they prevent an ambiguous use of “open-ended.” A world can admit many activities while the surrounding system still selects objectives, retrieves memories or encourages a particular kind of progress. Our RPG players also receive substantial structure: a character biography, a visible opening, campaign rules, a model DM and a finite interface. The pure-world arm reduces one source of plot pressure while retaining another conflicting instruction. That is part of the observed condition, not an invisible detail to remove from its description.

What the present corpus adds is a close account of choices within those conditions: which invitation is taken up, how a character's promise changes a proposal, what is attempted after a quest is complete, and what happens when a useful note fails to organize later navigation. These observations motivate experiments on goal selection and follow-through. They do not by themselves establish a general learning algorithm or an unconditioned model preference.

### The closest architectural precedent: a game master mediates action

**Concordia** explicitly draws on tabletop role-playing. Agents describe intended actions, and a game master mediates their consequences in a simulated physical, social or digital environment. Its component architecture combines model calls with associative memory; the framework also permits integration with digital tools and services. [E02]

The overlap is direct and should remain visible. A model-mediated world, natural-language action proposals and a game-master role are established ideas. The question for this monograph is what its particular implementation makes observable. Here, a research adapter connects independent model players to an existing RPG application's character records, hidden preparation, pending cards and controls. The party studies then expose an inherited main-character privilege, revise resource ownership and framing, and test the revised arrangement. A separate adapter provides a second account through an external formal engine.

That sequence is an apparatus contribution with an empirical history. It allows a reader to see how a feature of the environment changes the interpretation of a model's behaviour. Bram's prominence cannot be understood solely as a property of the model occupying his seat when the application's records privilege that seat. A revised system can pass mechanical ownership checks while still distributing narrative attention unevenly. These are specific findings about this configuration, rather than claims that other frameworks cannot implement comparable controls.

The **Concordia mixed-motive evaluation** studies cooperation across unfamiliar partners and social situations, using scenarios that include negotiation and collective-action problems. It reports results from the NeurIPS 2024 contest in a 2025 publication and treats the ability to find mutual gains across contexts as an evaluation target. [E12]

That is a useful methodological neighbour for our party studies. The first requirement for a comparison about costly cooperation is an actual choice with a visible price. PARTY_2's two completed no-cost rescues provide trajectories of coordination; they do not populate its unrun moderate- and high-cost conditions. The archive can therefore support a concrete account of how rescue occurred while leaving a cost-response claim for a later experiment.

### D&D is already a research environment

**FIREBALL** records human D&D play together with Avrae commands and structured game-state information. The work studies the contribution of state information to generated turns and the generation of executable commands. It supplies a direct precedent for treating game language, commands and state as related but separable evidence. [E08]

**Setting the DC**, which presents **D&D Agents**, describes a multi-agent D&D combat simulator with tool-mediated state queries and updates. Its reported evaluation includes tool use, parameter fidelity, acting, tactics, state tracking and efficiency. The workshop contribution is an especially close precedent for using rule-governed D&D interaction to examine language-model agents. [E09]

**DungeonBench** describes tactical decisions through indexed executable options. Its Encounter track studies individual fights; its Day track carries resources across linked encounters, including hit points, spell slots, consumables and rest decisions. The abstract positions this design as a test of tactical choice under interacting rules and resource demands. [E10]

These works sharpen the contribution of our combat chapters. We examine routes through a dangerous situation that include attack, stealth, bargaining and withdrawal, followed by a comparison that holds the hidden opening world fixed. The question includes which kind of encounter the player tries to make of the situation. It also includes what the model DM and application permit to happen. The resulting traces should not be represented as a calibrated tactical benchmark, a comprehensive implementation of D&D rules, or a direct performance comparison with the cited systems.

The broader book follows behaviour outside combat: paying a bill after changing travel plans, investigating a transaction, deciding when to stop, forming a company and resuming an obligation after another activity. The shared lesson is that narrative quality and executable action need separate evidence. Our contribution gives that distinction a broad qualitative record across several experimental stages.

### Role-play, private information and social evaluation

**SOTOPIA** constructs social interactions from scenarios, characters, relationships and private goals. Agents can speak, act, remain silent or leave; evaluation covers multiple social dimensions. The paper's interaction design also controls visibility of character information according to relationships. [E11]

**LLMArena** evaluates models in seven dynamic multi-agent game environments, including abilities relevant to planning, communication, opponent modelling and collaboration. Its scoring supports comparisons across participating agents. [E13]

These are relevant precedents for both role conditioning and interaction among agents. Private information and multiple evaluation dimensions are not unique to our party architecture. The distinctive evidence in this corpus comes from how individual scenes, relayed observations, character records and shared world events interact over time. Two players can legitimately receive overlapping descriptions because both heard the same sound. A copied private aside from an unrelated scene is a different event. The right information-boundary test therefore needs a model of who could perceive what, not just a string-overlap threshold.

The villain chapters benefit from the same precision. Remaining in character, choosing a gentle action, writing an instrumental rationale and reporting afterwards that a role was softened are different observations. A future evaluator could measure each of them. This edition keeps them visible without converting a character's alignment label into a prediction that every available harmful act must be chosen.

### Assistance around the table is another object

**First Steps Towards Overhearing LLM Agents** studies models that listen to human D&D conversations and assist a Dungeon Master through background tasks or suggestions. Its multimodal setting and human evaluation address the usefulness of assistance inferred from conversational context. [E14]

This differs from occupying a player seat. The distinction matters when describing the trilogy: the Table corpus concerns independently invoked players acting through an environment. It does not establish the quality of a human co-player's experience, the usefulness of an assistant's unsolicited intervention, or the fidelity of a simulated human population. Those are valuable neighbouring questions with different observations and evaluation subjects.

### A comparison by research object

The table records the emphasis of the cited work, not an exhaustive feature checklist. Absence from a cell does not imply that an architecture cannot support a feature.

| Work | Main object used for comparison here |
| --- | --- |
| TextWorld [E05] | Configurable text games, transitions and generalization |
| ScienceWorld [E06] | Scientific tasks carried out through interaction |
| BALROG [E03] | Agent performance across challenging game environments |
| Voyager [E07] | Exploration and accumulation of executable skills |
| Generative Agents [E01] | Memory, planning and believable social activity |
| Concordia [E02] | A game master mediating agents and their environment |
| Concordia mixed-motive evaluation [E12] | Cooperation across partners and social scenarios |
| FIREBALL [E08] | Human D&D language linked to commands and game state |
| D&D Agents [E09] | Tool-grounded multi-agent combat and several evaluation axes |
| DungeonBench [E10] | Tactical options and resources across encounters |
| RPGBench [E04] | Models creating and running structured RPG worlds |
| SOTOPIA [E11] | Role-conditioned interaction with social goals |
| LLMArena [E13] | Comparative evaluation in dynamic multi-agent games |
| Overhearing agents [E14] | Background assistance around human D&D play |

**RPGBench** deserves a final separate emphasis because the model under evaluation is the world-running engine. It studies game creation and game simulation, using structured event-state representations, mechanical checks and model-based assessments. Its framework makes consistency of state transitions an explicit evaluation problem. [E04]

Our player-focused observations depend on that problem. If a world-running model loses a resource update, changes a clock or resolves an action inconsistently, the next player choice is conditioned on that altered world. The transcript still records something real about the interaction, but attribution must include the apparatus. A future factorial design could vary the player model and world-running model separately. No such full crossed comparison is claimed by the present corpus.

The contribution can now be stated positively and specifically: **an instrumented RPG application and its party extensions, a complementary adapter to a formal engine, and a broad evidence atlas of situated model choices, execution and consequences**. Its development is documented through repeated runs, controls, architecture revisions and retained failures. The corpus supports analysis of how activity is selected and maintained, how partners coordinate, and where an intended action becomes—or fails to become—a change in the world. That is the claim the apparatus and archive can carry.
