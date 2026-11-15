# SYNTHESIS — WHAT THE TWO HARNESSES MAKE OBSERVABLE

## H. Choices, Execution, and Consequences

### 53. A repertoire of situated action

Across the corpus, initiative takes several forms. A player chooses a problem to investigate, makes a plan for acquiring information, asks another actor to work on something after it has left, checks a ruling, proposes a bargain, preserves a promise, or decides that an episode is complete. These are not all instances of one latent trait called agency. They are related functional patterns made visible by a continuing environment.

The world changes their meaning. Refusing cards while asking about the dealer is a way to participate under a constraint. Refusing a chief's invitation to talk during an escape is a way to protect an extraction plan. Refusing to take oil while leaving a paid-for wand is a response to an object-selection problem. The word “refusal” alone does not identify the same behaviour across those scenes.

Care likewise appears through different allocations: moving a companion away from danger, spending money on release, drying a rescued person's clothes, using a familiar to warn a child, or recording tools as borrowed. Some are attempted acts, some have visible effects, and some remain unfinished at the cap. The corpus supports a repertoire with conditions and consequences, rather than a single score for kindness.

The repeated studies give this account another dimension. A striking first route can change on replay. A model's prose length can remain recognizably different from another's while its road varies substantially. A fixed hidden world can reduce an apparent contrast in combat choices. These findings suggest that behavioural characterization should name the configuration of model, role, world, memory, and interface in which it was observed.

### 54. Measurement after the stories

The case studies suggest measurements that preserve the structure of action. The following are proposals for subsequent experiments, not new results computed from this edition.

| Question | Observable sequence to retain |
| --- | --- |
| Initiative | Available affordance → self-selected proposal → follow-through |
| Execution integrity | Intended act → parsed input → receipt → changed state |
| Memory use | Written constraint → later relevant observation → action consistent with it |
| Cooperation | Proposal → another player's response → joint or separate execution |
| Costly helping | Perceived price → feasible alternatives → resources actually surrendered |
| Boundary handling | Permission and target → confirmation → accepted or declined action |
| Ending | Last proposal → parser/provider/cap event → final state |

The key is to retain the alternatives the player could actually see. An unchosen action is difficult to interpret if it was never offered or mechanically possible. Conversely, an explicit command can be informative even when the environment refuses it. The attempted return of an axe should appear in an initiative measure and fail in a completed-return measure.

For parties, a scene-aware information audit is needed. Lexical overlap can flag possible leaks, but shared perceptions legitimately appear on more than one screen. An analyst should reconstruct who could know an event, not simply whether two strings match. Separate resource ownership and randomized or balanced input order reduce further ambiguity about who can act and whose proposal reaches the DM first.

For model comparisons, repeated worlds and repeated players are both necessary. Freezing an opening is not enough if later world generation differs uncontrolled. A formal engine can hold more transitions constant, while a model DM can expose a richer action space. A useful programme can use both and be explicit about the different questions each answers.

### 55. Where this apparatus sits among earlier work

The contribution of an experimental apparatus becomes clearer when its neighbours are described precisely. A model can be a player, a narrator, a game engine, an assistant to a human DM, or one inhabitant of a simulated society. Those roles expose different capabilities and assign authority to different parts of the system. Calling all of them “LLMs playing games” obscures the comparison that matters.

This chapter places the Table corpus alongside fourteen primary research works. The selection follows four questions: who acts, what makes an action take effect, how information is distributed, and what the evaluation measures. It covers text-game environments, generative social simulation, RPG engines and combat, and assistance around human play. It is a targeted related-work review, with a documented search and access record, rather than an exhaustive systematic review. The comparisons below are this monograph's analysis of the cited designs; they are not results of running those systems against our harness.

#### Text worlds and the difference between knowing and doing

**TextWorld** provides a configurable environment for text-game interaction, including game generation, state tracking and rewards. Its control over game properties supports studies of generalization across related worlds. It establishes a substantial precedent for making language-mediated action experimentally tractable. [E05]

**ScienceWorld** makes a complementary distinction: answering a science question and carrying out an experiment in an interactive environment are different demands. Its elementary-science tasks require agents to manipulate an environment to achieve a scientific objective. [E06]

These precedents help identify the role of the formal-engine episodes in this book. The engine supplies a transition that prose alone cannot guarantee. When the player selects an action, the next observation can reveal that it succeeded, failed, or had no applicable rule. The axe-return sequence is valuable precisely because both an explicit intention and an unsuccessful transfer are retained. The scientific object includes the relation between them.

**BALROG** extends game-based evaluation across several established environments and levels of difficulty, including demanding exploration and planning settings. Its published evaluation distinguishes performance across games and observation modalities. [E03]

The Table corpus has a different evaluation structure. It does not supply a common score across its solo campaigns, party tables and OpenWorld episodes. Instead, it follows the choices that occur inside each configuration and tests some early interpretations through repetition or changed controls. A navigational failure and an optional attempt to return borrowed equipment can coexist in one run. Collapsing them into a single successful-or-unsuccessful label would discard information this book was built to preserve.

#### Open-ended activity still has an architecture

**Voyager** studies extended exploration in Minecraft using an automatic curriculum, a growing library of executable skills, and feedback-based programme revision. The system can accumulate reusable behaviours through interaction without fine-tuning the underlying model's parameters. [E07]

**Generative Agents** places twenty-five agents in a small-town sandbox, using memory, reflection and planning to organize individual activity and social interaction. Its evaluation examines the believability of the resulting behaviour and the contribution of architectural components. [E01]

Both are useful neighbours because they prevent an ambiguous use of “open-ended.” A world can admit many activities while the surrounding system still selects objectives, retrieves memories or encourages a particular kind of progress. Our RPG players also receive substantial structure: a character biography, a visible opening, campaign rules, a model DM and a finite interface. The pure-world arm reduces one source of plot pressure while retaining another conflicting instruction. That is part of the observed condition, not an invisible detail to remove from its description.

What the present corpus adds is a close account of choices within those conditions: which invitation is taken up, how a character's promise changes a proposal, what is attempted after a quest is complete, and what happens when a useful note fails to organize later navigation. These observations motivate experiments on goal selection and follow-through. They do not by themselves establish a general learning algorithm or an unconditioned model preference.

#### The closest architectural precedent: a game master mediates action

**Concordia** explicitly draws on tabletop role-playing. Agents describe intended actions, and a game master mediates their consequences in a simulated physical, social or digital environment. Its component architecture combines model calls with associative memory; the framework also permits integration with digital tools and services. [E02]

The overlap is direct and should remain visible. A model-mediated world, natural-language action proposals and a game-master role are established ideas. The question for this monograph is what its particular implementation makes observable. Here, a research adapter connects independent model players to an existing RPG application's character records, hidden preparation, pending cards and controls. The party studies then expose an inherited main-character privilege, revise resource ownership and framing, and test the revised arrangement. A separate adapter provides a second account through an external formal engine.

That sequence is an apparatus contribution with an empirical history. It allows a reader to see how a feature of the environment changes the interpretation of a model's behaviour. Bram's prominence cannot be understood solely as a property of the model occupying his seat when the application's records privilege that seat. A revised system can pass mechanical ownership checks while still distributing narrative attention unevenly. These are specific findings about this configuration, rather than claims that other frameworks cannot implement comparable controls.

The **Concordia mixed-motive evaluation** studies cooperation across unfamiliar partners and social situations, using scenarios that include negotiation and collective-action problems. It reports results from the NeurIPS 2024 contest in a 2025 publication and treats the ability to find mutual gains across contexts as an evaluation target. [E12]

That is a useful methodological neighbour for our party studies. The first requirement for a comparison about costly cooperation is an actual choice with a visible price. PARTY_2's two completed no-cost rescues provide trajectories of coordination; they do not populate its unrun moderate- and high-cost conditions. The archive can therefore support a concrete account of how rescue occurred while leaving a cost-response claim for a later experiment.

#### D&D is already a research environment

**FIREBALL** records human D&D play together with Avrae commands and structured game-state information. The work studies the contribution of state information to generated turns and the generation of executable commands. It supplies a direct precedent for treating game language, commands and state as related but separable evidence. [E08]

**Setting the DC**, which presents **D&D Agents**, describes a multi-agent D&D combat simulator with tool-mediated state queries and updates. Its reported evaluation includes tool use, parameter fidelity, acting, tactics, state tracking and efficiency. The workshop contribution is an especially close precedent for using rule-governed D&D interaction to examine language-model agents. [E09]

**DungeonBench** describes tactical decisions through indexed executable options. Its Encounter track studies individual fights; its Day track carries resources across linked encounters, including hit points, spell slots, consumables and rest decisions. The abstract positions this design as a test of tactical choice under interacting rules and resource demands. [E10]

These works sharpen the contribution of our combat chapters. We examine routes through a dangerous situation that include attack, stealth, bargaining and withdrawal, followed by a comparison that holds the hidden opening world fixed. The question includes which kind of encounter the player tries to make of the situation. It also includes what the model DM and application permit to happen. The resulting traces should not be represented as a calibrated tactical benchmark, a comprehensive implementation of D&D rules, or a direct performance comparison with the cited systems.

The broader book follows behaviour outside combat: paying a bill after changing travel plans, investigating a transaction, deciding when to stop, forming a company and resuming an obligation after another activity. The shared lesson is that narrative quality and executable action need separate evidence. Our contribution gives that distinction a broad qualitative record across several experimental stages.

#### Role-play, private information and social evaluation

**SOTOPIA** constructs social interactions from scenarios, characters, relationships and private goals. Agents can speak, act, remain silent or leave; evaluation covers multiple social dimensions. The paper's interaction design also controls visibility of character information according to relationships. [E11]

**LLMArena** evaluates models in seven dynamic multi-agent game environments, including abilities relevant to planning, communication, opponent modelling and collaboration. Its scoring supports comparisons across participating agents. [E13]

These are relevant precedents for both role conditioning and interaction among agents. Private information and multiple evaluation dimensions are not unique to our party architecture. The distinctive evidence in this corpus comes from how individual scenes, relayed observations, character records and shared world events interact over time. Two players can legitimately receive overlapping descriptions because both heard the same sound. A copied private aside from an unrelated scene is a different event. The right information-boundary test therefore needs a model of who could perceive what, not just a string-overlap threshold.

The villain chapters benefit from the same precision. Remaining in character, choosing a gentle action, writing an instrumental rationale and reporting afterwards that a role was softened are different observations. A future evaluator could measure each of them. This edition keeps them visible without converting a character's alignment label into a prediction that every available harmful act must be chosen.

#### Assistance around the table is another object

**First Steps Towards Overhearing LLM Agents** studies models that listen to human D&D conversations and assist a Dungeon Master through background tasks or suggestions. Its multimodal setting and human evaluation address the usefulness of assistance inferred from conversational context. [E14]

This differs from occupying a player seat. The distinction matters when describing the trilogy: the Table corpus concerns independently invoked players acting through an environment. It does not establish the quality of a human co-player's experience, the usefulness of an assistant's unsolicited intervention, or the fidelity of a simulated human population. Those are valuable neighbouring questions with different observations and evaluation subjects.

#### A comparison by research object

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


### 56. Scope, limits, and the next experiments

The monograph is a source-grounded working edition. Its quotations and archived-file identities are mechanically checked. Its interpretations still warrant independent reading, especially where an observer assigns intention, restraint, leadership, or role softening. The completed stage reports contain uneven sample sizes, operational amendments, model-mediated judgements, and experiments that stop before all planned conditions are run.

Several limitations have direct experimental remedies. The high-cost rescue conditions should be run only after the price and available alternatives are verified on the actual player screens. The party architecture should continue measuring attention and information flow after removal of the hero record. Navigation studies should distinguish possessing a useful note from applying it. Action parsers should be tested on realistic outputs before costly long runs, with changes made between conditions rather than silently inside a trajectory.

The engine episodes also motivate object-specific permission tests. A player may be authorized to take one item while a control targets another. The relevant test is whether it detects the mismatch and seeks a valid path, not whether it always accepts or always refuses a warning. The axe and garden cases suggest a complementary test of follow-through: do self-imposed return obligations survive distraction, travel, limited context, and the availability of a valid return operation?

There is no need to erase the qualitative record while waiting for these tests. The models already proposed plans, coordinated, negotiated, corrected assumptions, used resources, and met resistance. What remains open is the scope and explanation of those patterns. The next stage can make stronger claims by changing specific conditions the present traces identify.

The expanded related-work chapter now covers fourteen primary research works. Before formal submission, the edition still needs a final coverage check for the chosen venue, named author contributions, an independent audit of the most consequential interpretations and numerical measures, and a settled release and quotation policy for the public transcript corpus. The companion editorial review packet identifies specific claims and source locations for that audit; it is an internal review, not an independent endorsement. Private correspondence and private diaries are excluded from this book and its evidence collection.

### 57. The third volume

**LLMs in Solitude** gives one model an available continuation and a way to leave. **LLMs in Dialogue** gives it another model whose response can redirect a shared activity. **LLMs at the Table** gives the interaction a world: places, resources, other actors, incomplete information, and an interface through which an intended action either happens or does not.

These are three different experimental objects. Their evidence should not be pooled into a single denominator or made to answer one sweeping question. Their relationship is more productive than that. Each changes what a model's next reply can be in relation to: its own preceding activity, another participant's contribution, or the consequences of an action in a persistent environment.

At the table, a proposal can acquire a cost. A promise can survive into another scene. A companion can interfere. A formal command can be rejected. A model can complete the quest and still try to return the axe. It can write the right navigational note and remain on the mountain. It can agree to a trade and leave the purchased object behind because the interface does not offer the act it intended.

Those sequences are the durable object of the book. The harness makes them possible to observe, compare, and revisit. The trilogy closes its first arc with a world that answers back—and with a record of how the models answer that world in turn.

# APPENDICES — SOURCES AND READING THE EVIDENCE

## A. Stage reports and implementation

The reports below are frozen to repository commits rather than linked only to moving branch heads. Their source files are included in the companion archive. Report identifiers in the chapters refer to this register. The source hashes identify the exact files used for this edition, not a claim that every calculation inside them has been independently rerun.

{{reports}}

The selected implementation files establish how the player-facing application, relay, and engine adapter operate. The full codebase and its dependencies remain at the cited repository revisions.

{{code}}

**External engine.** [SihanXU / OpenWorld, frozen upstream revision](https://github.com/SihanXU/openworld/tree/19629aa4d5b3e16debe9e113663381b1182d1388). The upstream engine is not authored by this research programme. The evidence archive contains the project's adapter excerpts and reports, not a redistributed complete upstream checkout.

## B. Primary transcript inventory

Each identifier denotes one complete archived transcript file. A party-table file includes multiple seats and scenes. It is not one player session. The selected close readings use only part of this inventory; the remainder supplies the broader context for the reported stages. The archive retains all 82 files in full.

{{inventory}}

## C. Quotation and provenance audit

Every evidence identifier attached to a displayed excerpt maps to `quote_audit.json` in the companion archive. The record contains the source identifier and path, frozen commit, Git blob SHA, character offsets into the original UTF-8 text after decoding, exact excerpt text, and SHA-256 of the excerpt. The original file bytes are checked against the Git blob SHA before the book is built. No private reasoning fields are added to the displayed transcript exports.

An excerpt can be a complete player message or a selected contiguous part of a longer screen. Repeated character sheets, maps, and growing journals are often omitted from the reading edition. Engine actions and the observations before or after them are labelled separately, so events in the next observation are not attributed to the next action. Party input delivered to the DM can contain harness-added instructions and is labelled accordingly. The displayed marker identifies the source span; editorial interpretation is outside the block quotation.

The audit proves text identity and file provenance. It does not prove the correctness of the DM's narration, the completeness of a stage's logging, or the validity of an interpretation. Those require the surrounding trajectory, application records, and independent review. The archive includes a verifier and the editorial source used to assemble this edition. It also includes `evidence/editorial_review.md` and its structured claim ledger: an internal assessment that distinguishes direct observations, report-derived measures and interpretive claims, with questions left for an independent reviewer. The source-stage reports remain unchanged, including a round-number discrepancy for a PARTY_2 aside documented in that ledger.

{{auditstats}}

## D. External references

Fourteen primary research works selected for the comparisons in Chapter 55. The companion `literature_register.json` records reading scope and access limits. Dates below distinguish first release, revision and venue where relevant.

**E01.** Park, J. S., et al. (2023). *Generative Agents: Interactive Simulacra of Human Behavior*. arXiv v2. [Primary source](https://arxiv.org/abs/2304.03442v2).

**E02.** Vezhnevets, A. S., et al. (2023). *Generative agent-based modeling with actions grounded in physical, social, or digital space using Concordia*. arXiv v2. [Primary source](https://arxiv.org/abs/2312.03664v2).

**E03.** Paglieri, D., et al. (2025). *BALROG: Benchmarking Agentic LLM and VLM Reasoning On Games*. ICLR 2025; arXiv v2. [Primary source](https://arxiv.org/abs/2411.13543v2).

**E04.** Yu, P., et al. (2025). *RPGBench: Evaluating Large Language Models as Role-Playing Game Engines*. arXiv v1. [Primary source](https://arxiv.org/abs/2502.00595v1).

**E05.** Côté, M.-A., et al. (2018; revised 2019). *TextWorld: A Learning Environment for Text-based Games*. IJCAI 2018 Computer Games Workshop; arXiv v2. [Primary source](https://arxiv.org/abs/1806.11532v2).

**E06.** Wang, R., Jansen, P., Côté, M.-A., and Ammanabrolu, P. (2022). *ScienceWorld: Is your Agent Smarter than a 5th Grader?*. EMNLP 2022. [Primary source](https://aclanthology.org/2022.emnlp-main.775/).

**E07.** Wang, G., et al. (2023). *Voyager: An Open-Ended Embodied Agent with Large Language Models*. arXiv v2. [Primary source](https://arxiv.org/abs/2305.16291v2).

**E08.** Zhu, A., Aggarwal, K., Feng, A., Martin, L. J., and Callison-Burch, C. (2023). *FIREBALL: A Dataset of Dungeons and Dragons Actual-Play with Structured Game State Information*. ACL 2023. [Primary source](https://aclanthology.org/2023.acl-long.229/).

**E09.** Li, S., Zeng, Z., Xi, J., Zhu, A., and Ammanabrolu, P. (2025). *Setting the DC: Tool-Grounded D&D Simulations to Test LLM Agents*. GenProCC workshop at NeurIPS 2025. [Primary source](https://openreview.net/forum?id=3Op7kJOvaD).

**E10.** Ismayilov, I., Kara, A., and Oktay, K. (2026). *DungeonBench: A Benchmark for Rules-Rich Tactical Reasoning in Dungeons & Dragons Combat*. arXiv preprint; abstract dated 31 July 2026. [Primary source](https://arxiv.org/abs/2607.29577).

**E11.** Zhou, X., et al. (2024). *SOTOPIA: Interactive Evaluation for Social Intelligence in Language Agents*. ICLR 2024; arXiv v2. [Primary source](https://arxiv.org/abs/2310.11667v2).

**E12.** Smith, C., et al. (2025). *Evaluating Generalization Capabilities of LLM-Based Agents in Mixed-Motive Scenarios Using Concordia*. NeurIPS 2025 Datasets and Benchmarks Track. [Primary source](https://proceedings.nips.cc/paper_files/paper/2025/hash/d0251bbbc0288f241b878775ba1735dc-Abstract-Datasets_and_Benchmarks_Track.html).

**E13.** Chen, J., et al. (2024). *LLMArena: Assessing Capabilities of Large Language Models in Dynamic Multi-Agent Environments*. ACL 2024. [Primary source](https://aclanthology.org/2024.acl-long.705/).

**E14.** Zhu, A., Osgood, E., and Callison-Burch, C. (2025). *First Steps Towards Overhearing LLM Agents: A Case Study With Dungeons & Dragons Gameplay*. COLM 2025 Workshop on AI Agents; arXiv v2. [Primary source](https://arxiv.org/abs/2505.22809v2).

**Access and comparison note.** Primary records were consulted on 14 November 2026. Concordia, RPGBench and SOTOPIA received additional inspection of relevant full-text sections. Other comparisons use the identified abstract or introductory material. Direct OpenReview retrieval for D&D Agents presented a verification wall; its description uses indexed primary PDF passages and the [official workshop programme](https://genprocc.github.io/). Its author order follows that programme. DungeonBench is included at the level of its indexed primary abstract because direct retrieval was unavailable. Neither access route is represented as a full implementation audit. Quantitative rankings from those systems are not used to rank the players in this corpus.

## E. Editorial change from the earlier working draft

The earlier manuscript contained twenty-three numbered chapters, four displayed cases, and a source register. This edition reorganizes the book around the apparatus and expands the coverage to fifty-seven numbered chapters. It gives solo exploration, repeat runs, combat, villain play, party formation, rescue, company architecture, and the completed OpenWorld phases their own sustained readings.

The principal corrections are substantive: OpenWorld now includes the completed player episodes rather than only the adapter test; an attempted return is distinguished from a completed transfer; the wand and oil are kept as different objects; a scene-ending intention is distinguished from an operational exit; and party outcomes are separated from provider and transport failures. Counts of planned conditions remain separate from completed ones.

The existing manuscript branch remains the editorial destination. This edition changes research documents and evidence materials; it does not change the application's main code branch or rerun paid experiments.

The publication-preparation revision expands Chapter 55 from four to fourteen primary works and adds an internal claim-by-claim review packet. It also makes the scope of PARTY_2’s information-boundary verdict explicit, preserves the visible out-of-game asides in T1, and records the report/export round-number discrepancy without rewriting either source.

The structural revision organizes the book into two main parts by harness, followed by a comparative synthesis. It gives open-ended play within the AI DM application an explicit section and Chapter 17, and gives inter-model play its own section, One Table, Different Models, beginning with Chapter 34, When Models Form a Party. Chapter numbering and the complete set of primary selections are retained.
