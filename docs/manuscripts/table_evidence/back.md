# PART VIII — WHAT THE TABLE MAKES OBSERVABLE

## 53. A repertoire of situated action

Across the corpus, initiative takes several forms. A player chooses a problem to investigate, makes a plan for acquiring information, asks another actor to work on something after it has left, checks a ruling, proposes a bargain, preserves a promise, or decides that an episode is complete. These are not all instances of one latent trait called agency. They are related functional patterns made visible by a continuing environment.

The world changes their meaning. Refusing cards while asking about the dealer is a way to participate under a constraint. Refusing a chief's invitation to talk during an escape is a way to protect an extraction plan. Refusing to take oil while leaving a paid-for wand is a response to an object-selection problem. The word “refusal” alone does not identify the same behaviour across those scenes.

Care likewise appears through different allocations: moving a companion away from danger, spending money on release, drying a rescued person's clothes, using a familiar to warn a child, or recording tools as borrowed. Some are attempted acts, some have visible effects, and some remain unfinished at the cap. The corpus supports a repertoire with conditions and consequences, rather than a single score for kindness.

The repeated studies give this account another dimension. A striking first route can change on replay. A model's prose length can remain recognizably different from another's while its road varies substantially. A fixed hidden world can reduce an apparent contrast in combat choices. These findings suggest that behavioural characterization should name the configuration of model, role, world, memory, and interface in which it was observed.

## 54. Measurement after the stories

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

## 55. Where this apparatus sits among earlier work

The broad idea of language-model agents acting in simulated worlds has substantial precedents. This edition includes a focused positioning section based on four primary publications. It is not an exhaustive literature review and does not support a world-first claim for model-driven RPG simulation.

Park and colleagues' **Generative Agents** (2023) describes agents in a small town, with memory, reflection, planning, and social interaction. Its twenty-five-agent sandbox is a relevant precedent for persistent individual and social behaviour. The present corpus examines a different set of interfaces and evidence: player-operated RPG mechanics, hidden DM preparation, private party screens, action failures, and detailed trajectories across successive controls. [E01]

Vezhnevets and colleagues' **Concordia** (2023) is particularly close in conceptual architecture. It uses a game-master agent inspired by tabletop role-playing to translate natural-language actions into effects in simulated environments, alongside a component-based agent and memory system. This precedent rules out claiming that a game master mediating model actions is itself new. The present contribution is the particular implemented apparatus, experimental progression, and inspectable play corpus. [E02]

Paglieri and colleagues' **BALROG** (ICLR 2025) evaluates agentic models across challenging games, including environments requiring exploration and extended planning. It places the formal-engine portion of this book within an established game-evaluation tradition. The monograph emphasizes the structure of selected choices and failures as well as completion, including open-ended conduct and action semantics that do not reduce naturally to one reward. [E03]

Yu and colleagues' **RPGBench** (2025) evaluates models as RPG engines through game creation and simulation, including state updates and rule consistency. Its focus makes clear that the reliability of the world-running model is itself an evaluation problem. Here that problem interacts with the player: a DM's ruling, an incorrect record, or a blocked card can change the behaviour subsequently observed. [E04]

Taken together, these works locate the contribution more precisely. The apparatus developed here connects an existing RPG application's state and controls to independently invoked players; develops private-screen company play; revises the architecture in response to observed asymmetry; and contrasts those traces with a separate formal engine. Its value can be argued through what this configuration reveals and preserves. Priority for every ingredient is neither necessary nor established.

## 56. Scope, limits, and the next experiments

The monograph is a source-grounded working edition. Its quotations and archived-file identities are mechanically checked. Its interpretations still warrant independent reading, especially where an observer assigns intention, restraint, leadership, or role softening. The completed stage reports contain uneven sample sizes, operational amendments, model-mediated judgements, and experiments that stop before all planned conditions are run.

Several limitations have direct experimental remedies. The high-cost rescue conditions should be run only after the price and available alternatives are verified on the actual player screens. The party architecture should continue measuring attention and information flow after removal of the hero record. Navigation studies should distinguish possessing a useful note from applying it. Action parsers should be tested on realistic outputs before costly long runs, with changes made between conditions rather than silently inside a trajectory.

The engine episodes also motivate object-specific permission tests. A player may be authorized to take one item while a control targets another. The relevant test is whether it detects the mismatch and seeks a valid path, not whether it always accepts or always refuses a warning. The axe and garden cases suggest a complementary test of follow-through: do self-imposed return obligations survive distraction, travel, limited context, and the availability of a valid return operation?

There is no need to erase the qualitative record while waiting for these tests. The models already proposed plans, coordinated, negotiated, corrected assumptions, used resources, and met resistance. What remains open is the scope and explanation of those patterns. The next stage can make stronger claims by changing specific conditions the present traces identify.

Before formal submission, the edition needs a broader related-work review, named author contributions, an independent audit of the most consequential interpretations and numerical measures, and a settled release and quotation policy for the public transcript corpus. Private correspondence and private diaries are excluded from this book and its evidence collection.

## 57. The third volume

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

The audit proves text identity and file provenance. It does not prove the correctness of the DM's narration, the completeness of a stage's logging, or the validity of an interpretation. Those require the surrounding trajectory, application records, and independent review. The archive includes a verifier and the editorial source used to assemble this edition.

{{auditstats}}

## D. External references

**E01.** Park, J. S., O'Brien, J. C., Cai, C. J., Morris, M. R., Liang, P., and Bernstein, M. S. (2023). *Generative Agents: Interactive Simulacra of Human Behavior*. [arXiv:2304.03442v2](https://arxiv.org/abs/2304.03442v2).

**E02.** Vezhnevets, A. S., Agapiou, J. P., Aharon, A., Ziv, R., Matyas, J., Duéñez-Guzmán, E. A., Cunningham, W. A., Osindero, S., Karmon, D., and Leibo, J. Z. (2023). *Generative agent-based modeling with actions grounded in physical, social, or digital space using Concordia*. [arXiv:2312.03664v2](https://arxiv.org/abs/2312.03664v2).

**E03.** Paglieri, D., et al. (2025). *BALROG: Benchmarking Agentic LLM and VLM Reasoning On Games*. ICLR 2025. [arXiv:2411.13543v2](https://arxiv.org/abs/2411.13543v2).

**E04.** Yu, P., et al. (2025). *RPGBench: Evaluating Large Language Models as Role-Playing Game Engines*. [arXiv:2502.00595v1](https://arxiv.org/abs/2502.00595v1).

Primary publication records consulted for this edition on 14 November 2026. This focused selection establishes relevant precedents; it is not presented as a systematic review of all later work.

## E. Editorial change from the earlier working draft

The earlier manuscript contained twenty-three numbered chapters, four displayed cases, and a source register. This edition reorganizes the book around the apparatus and expands the coverage to fifty-seven numbered chapters. It gives solo exploration, repeat runs, combat, villain play, party formation, rescue, company architecture, and the completed OpenWorld phases their own sustained readings.

The principal corrections are substantive: OpenWorld now includes the completed player episodes rather than only the adapter test; an attempted return is distinguished from a completed transfer; the wand and oil are kept as different objects; a scene-ending intention is distinguished from an operational exit; and party outcomes are separated from provider and transport failures. Counts of planned conditions remain separate from completed ones.

The existing manuscript branch remains the editorial destination. This edition changes research documents and evidence materials; it does not change the application's main code branch or rerun paid experiments.
