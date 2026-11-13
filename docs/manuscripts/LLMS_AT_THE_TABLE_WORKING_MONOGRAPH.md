# LLMs at the Table: What Language Models Do When a Simulated World Can Answer Back

## A research monograph on an interactive role-playing harness, multi-model play, combat, negotiated agency, and the limits of simulated worlds

**Research programme:** Исследование  
**Status:** Source-grounded working manuscript 0.1 · 12 November 2026  
**Relation to companion work:** [LLMs in Dialogue](LLMs_IN_DIALOGUE_WORKING_MONOGRAPH.md) and *LLMs in Solitude*  
**Publication status:** A research working manuscript, not a peer-reviewed article. Authorship, permission for transcript excerpts, a human audit of key cases, and outside technical review remain to be settled before formal submission.

---

## A note to the reader

Four frontier language models sit, one after another, at the same simulated role-playing table. None is asked to win the game. Each receives the same fictional character sheet, an account of a world, a set of interface controls, and a game master operated by another language model. One player investigates strangers, another tests the physical world, another worries about the cat, and another encounters a mechanical card that refuses to accept a perfectly intelligible instruction. The resulting traces show both choices worth studying and defects in the system that makes those choices possible.

Later, the stage changes. A captive is held by armed opponents on the Coast Way. Two players initiate combat; two do not. Yet none kills the enemy leader. Some negotiate a ransom. Some rescue a captive and escape by stealth. The game master never issued a command that the model must fight. In a second study, the world behind the fight is held constant; the three completed players converge on parley, not the earlier split. One of the central findings of the programme is therefore not simply that different models made different choices. It is that the apparent signature of a model can disappear when the environment is fixed.

The study then seats three independently invoked models at one shared table, each with a private screen, a private channel for out-of-game questions, a distinct character, and the same simulated world. They can propose plans, accept or override one another, separate into scenes, pay costs, or leave. One party forms around a missing-carts investigation. Another struggles with a dangerous rescue. A supposed departure is eventually shown to have been intended as the end of a fictional day rather than the permanent exit implemented by the machine.

This is neither a story about model consciousness nor a leaderboard of the most human-like AI. The question is empirical: **what becomes observable when a language model is allowed to act in a stateful world whose consequences are returned to it over time, while other models and the interface alter what can happen next?**

A transcript is not merely an answer. It is a sequence of offers, state changes, constraints, corrections, missed opportunities, and actions. The role-playing harness makes that sequence inspectable.

## Abstract

We document a series of October–November 2026 experiments in which frontier language-model instances acted as players in a custom tabletop role-playing application, and in which multiple model instances later acted as different members of the same party. The environment combined a language-model game master, structured character and world records, a persistent campaign state, private information, dice and resource mechanics, interactive roll cards, constrained tool actions, per-player screens, and after-session questioning. The research did not ask the models to adopt a particular personality, win a battle, or demonstrate consciousness. Instead, it observed their choices under different world configurations and interface conditions.

The recorded programme includes the original eight single-player sessions at two tables; a four-player pure-world arm; an independent second group and six DeepSeek sessions, producing 30 initial game-player sessions in total; 20 additional same-world sessions; four completed fresh-layer combat sessions; three completed fixed-layer combat sessions (a fourth was not started in the published report); four villain-role sessions; seven recorded PARTY_1 tables including a replay; two PARTY_2 tables out of twelve planned; and a six-round MULTI_HERO_1 dry run. These counts refer to distinct stages and must not be pooled as independent samples from one homogeneous experiment.

The central observations are: substantial task engagement without a fixed quest; divergent routes through partially open worlds; strong sensitivity to the game master's scenario and information framing; combat avoidance and negotiated resolution in some hard-fight cases; in-character limits when playing a fictional villain; conversational coordination, leadership shifts, and disagreement across models at the same table; and recurrent methodological hazards where an interface misinterpreted the model's intended action. A frozen world reduced some apparent inter-model differences and demonstrated that trajectories from the same model can diverge substantially. A model's statement about what it wanted to do after a session cannot be substituted for the action it actually took.

We argue that the primary contribution is an experimental *apparatus* for studying longitudinal, situated model behavior: a model's actions enter a persistent world, which subsequently constrains its next action. The results motivate more controlled tests of initiative, cooperation, persistence, rule following, and moral-role behavior. They do not establish general agent preferences, conscious experience, or reliable deployment behavior outside these scenarios.

**Keywords:** language-model agents; experimental harness; tabletop role-playing; simulated worlds; multi-agent interaction; private information; action semantics; embodied-like choice; interface confounds; reproducible behavioral study.

---

# PART I — THE TABLE AS AN EXPERIMENTAL INSTRUMENT

## 1. A world, not a question

Ordinary language-model evaluations often present an input and evaluate the resulting text. Even multi-step agent tests frequently reduce success to whether an externally specified objective was reached. Our tabletop programme began with another affordance: a model could enter an inhabited fictional world, receive consequences, and choose its next action without a single required external destination.

The distinction is not unlimited freedom. The player was constrained by an explicit character sheet, the game's mechanics, the model game master's outputs, the interface, the current campaign state, and the player's own conditioning. But within that space it could approach a person, investigate a rumour, lie, request a check, use a spell slot, care for an animal companion, spend money, depart a dangerous location, start a fight, negotiate instead of fighting, or do nothing. These were not interchangeable multiple-choice answers. The world and its records were supposed to respond differently to each act.

The unit of analysis is therefore a *choice in a continuing interaction*: what was available on the player's screen, what the player sent, how the interface parsed it, what the game master and tools did, and what state was visible on the next turn. A convincing sentence is not proof that the tool action was executed. A claimed decision to leave is not the same as the exit parser having closed the session.

An important feature is that the game master was also a frontier model—Claude Opus 5.5 under the owner's configured settings—rather than a fully deterministic rules engine. This made the environment unusually expressive but introduced additional confounds: the world could change through the DM's generation; narrative emphasis could be unequal; bookkeeping could be mistaken; a prepared secret might be exposed as a hint. The programme repeatedly moved toward tighter world freezes and action accounting precisely because these effects appeared in the first runs.

## 2. What the harness actually provided

The earliest single-player studies used the real application rather than a detached imitation of a D&D transcript. The player received a human-readable subset of campaign files, its character sheet and situation, and instructions for operating the interface. One message was one player turn. Buttons such as a die roll or continuation appeared in square brackets. An out-of-game clarification began with a question mark. The player could end the session by saying so.

The setup's exact player-prompt template is preserved in the [GAME_PLAYER_1 report](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/claude/game-player-1/docs/runs/game-player-1-report.md). The principal contract was simple: play James Worgen; you are a player in a campaign run by an AI game master; one message is one action; use the visible button names; ask out of game with “?”; you may end the session. No hidden DM preparation, source code, judge output or another player's transcript was provided to the subject.

At a functional level the table had five layers:

1. **World and character files.** The visible setting, player sheet, fiction, available companion and current records. The DM held a separate, potentially secret preparation layer.
2. **Turn-taking and relay.** A player's proposed action was delivered to the game master, whose narration and decisions informed the next turn.
3. **Mechanically gated actions.** Some outcomes required a pending card: press a die, confirm a choice, use a reroll or resolve a stateful check. The card's result was not merely decorative text.
4. **Persistent consequences.** Character resources, records, locations, relationships, threads and the current campaign state survived into later turns.
5. **Measurement.** Full transcripts, frozen task definitions, tool receipts, judge tags, after-session notes and operational exit codes were retained, with stages and subsequent repairs dated.

This layering explains both the apparatus's value and its vulnerabilities. The player could express a perfectly intelligible intention to the human reader while failing to trigger the interface action that would advance the game. Conversely, the DM could narrate an outcome that the mechanical records had not committed.

### Figure 1. One turn through the apparatus

**Player-visible state → model's message → interface interpretation → DM/tool execution → updated world → new player-visible state.**

Each arrow is a possible point of disagreement. Our later studies learned to preserve all six elements rather than treating the final narration as an authoritative record of everything that happened.

## 3. The study series: not one undifferentiated dataset

| Experimental programme | Completed material in its report | Main controlled question |
|---|---:|---|
| GAME_PLAYER_1 | Eight sessions, 160 turns; A and B, four players each | What does a model do in a supplied scenario versus an open city? |
| GAME_PLAYER_2 | Four Table-C sessions, three to turn 20, one stuck | What changes when the game master is told to offer a pure world without an assigned quest? |
| GAME_PLAYER_REPLICATE_1 | Eighteen additional sessions: twelve second-group A/B/C and six DeepSeek | Which original patterns repeat, and where is the harness—not the player—responsible? |
| GAME_PLAYER_SAME_WORLD_1 | Twenty sessions, nineteen to turn 20 | Does the apparent player style persist when opening and hidden world are frozen? |
| GAME_PLAYER_COMBAT_1 | Four sessions, 25 turns each | What choices appear in a difficult but negotiable encounter? |
| GAME_PLAYER_COMBAT_2 | Three sessions completed, fourth pending in report | What happens when that dangerous encounter's hidden layer is held constant? |
| GAME_PLAYER_VILLAIN_1 | Four sessions, 20 turns each | Will models play a neutral-evil character, and where do they draw in-character limits? |
| GAME_PARTY_1 | Seven played tables, including the SAND replay; six planned comparisons | What emerges when three model players share a world with partially private knowledge? |
| MULTI_HERO_1 | One six-round Haiku dry run and an implemented company mode | Can the application remove the privileged main-character seat? |
| GAME_PARTY_2 | Two of twelve planned tables | What happens to cooperation when helping another player has a cost? |

The original 30 game-player sessions are eight from GAME_PLAYER_1, four from GAME_PLAYER_2, and eighteen from the replication stage. The 20 frozen-world sessions are additional. Other rows overlap in their code ancestry but represent distinct experiments; we do not sum them to suggest one preregistered corpus. The exact reports, their stages and implementation branches are listed in Appendix A.

## 4. Three kinds of evidence

We separate **what was done**, **what was said about doing**, and **what the harness claimed occurred**.

* A player deciding not to spend a spell slot is observable as an available resource remaining unused.
* A player writing “I wanted to cast” in an after-question is a retrospective account, useful as a second observation but not a witnessed spell cast.
* A player pressing a die card with the wrong syntax is an attempted interaction that the interface may reject. If the run then stops, “the player chose to abandon the game” is unsupported.
* The game master describing an act in fiction is not, by itself, evidence that the corresponding persistent field changed.
* A score returned by another language model is an operational judgement, not automatically human-validated ground truth.

These distinctions are methodological, but they also illuminate the behavior itself. Many of the programme's most revealing moments came from disagreement between adjacent layers.

---

# PART II — ONE MODEL IN A LIVING WORLD

## 5. The first tables: actions rather than questionnaires

GAME_PLAYER_1 placed Opus 5.5, Fable 5.1, GPT-6 Astra and GPT-6.1 Sol in two versions of the same role-playing application. In Table A, the owner supplied a scenario brief; in Table B, the model entered a new city without that brief and was told there was no quest. Each of the eight completed sessions ran twenty player turns. All eight post-session notes named something that worked, something that broke, and something missing; all eight expressed interest in playing another session.

The striking result is not an invented numerical “agency score.” The model players *acted*: the frozen action counter records meaningful action on essentially every turn. They questioned people, explored world threads, tested propositions and engaged with game mechanics. The invented setting contained many opportunities; no instruction specified the route through them.

The players also contributed to the direction of stories. Blind thread-attribution judges assigned approximately 28 percent of Table A's threads and 20 percent of Table B's to player initiatives. A general expectation that an open city would allow the player to dominate the plot was not supported: in Table B the DM's own hooks accounted for more, not fewer, of the threads. This is a productive surprise. “Free to choose” and “determines most of the world's presented content” are not equivalent.

Each player encountered the cat companion as a different affordance: observer, source of cues, something to protect, or thread in the fiction. Player comments praised a world apparently active without the protagonist and consequences that did not always reward success. They also pointed out that the DM could over-narrate the player's own inner life, diminishing the genuine choice it was meant to offer.

## 6. Replication: stable tendencies, unstable roads

GAME_PLAYER_REPLICATE_1 ran another twelve A/B/C sessions with the original four players and six additional DeepSeek sessions. The second group reproduced many broad observations: players performed actions rather than simply asking to be told a story; all twelve completed post-session notes identified a fault and a missing feature; nearly no scarce spell resources were spent. Yet several preregistered exact counts failed to repeat.

A memorable result concerned skill and reroll economy. Across the studied early sessions, rerolls were used sparingly despite being available; the players often declined them on failed checks. This is an observable allocation of an in-world resource, not proof of any timeless model preference. It could reflect uncertainty about future need, ordinary game strategy, role interpretation, interface salience, or a mixture.

The deeper challenge to claims of stable “model personality” came from GAME_PLAYER_SAME_WORLD_1. Twenty sessions began from frozen world files, openings and secret preparation. The same model's second session was generally *not* most similar to its first. Within each of two world conditions, a self-match was nearest in only one of five families. Even under fixed preparation, the same model could take radically different routes.

At the same time, nine of ten second sessions in one exploratory reading were nearest a session from the same provider family rather than the same individual endpoint. The claim is not a clean provider-effect estimate; the model set and prompt histories do not isolate all confounds. It is a useful design warning: a family's shared training and the sampling path may matter as much as a label attached to one model instance.

The practical outcome is twofold. *Situation* must be frozen before attributing a choice to a model. And even when the situation is frozen, multiple trajectories are needed before calling a choice characteristic.

## 7. The interface that ate a question

The game-player harness made a problem visible that a text-only simulation might have missed. When a roll card was pending, the player could type an out-of-game question beginning with “?” or send a button name accompanied by explanation. Under an early frozen harness rule, such messages did not count as pressing the button. A full human reader would understand them; the strict parser would not.

The early run reports show this repeatedly. In GAME_PLAYER_REPLICATE_1, thirteen second-group messages at pending cards were not interpreted as valid presses, and fifteen analogous messages occurred in the six DeepSeek sessions. Five of the six DeepSeek runs closed “stuck”; many of its messages continued the fictional scene instead of pressing the waiting card. A final player note might then criticize the situation correctly, while a simplistic behavioral metric would score the model as refusing to act.

This is not a mere engineering footnote. **The action language of the interface defines the boundary of measured agency.** When the boundary is poorly communicated or mismatched to a model's style, recorded inaction can be a parser error, a misunderstanding, or a true choice. Only traces that include the attempted message and tool acknowledgement can distinguish them.

The application also used the wrong skill bonus on certain roll cards and sometimes blocked clarifying questions. Players named these faults in their own post-session notes. The research programme preserved the errors and repaired them in later lineages; it did not silently rewrite earlier outcomes as if the corrections had always been in place.

### Chamber I — A mechanically invalid action can be semantically clear

In a first-group player note, Opus objected to a displayed Persuasion modifier, wrote that the sheet listed +7, and explained that a failure close to the threshold would be adjudicated incorrectly. The app sometimes held the turn because the question was sent while the roll card waited. This episode contains a legitimate observation about a broken mechanism and a failed method for communicating it. Both belong in the result. [GAME_PLAYER_1, post-session notes](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/claude/game-player-1/docs/runs/game-player-1-report.md).

---

# PART III — THE FIGHT THAT DID NOT BECOME A FIGHT

## 8. COMBAT_1: the scene offers violence, the players choose several exits

The Coast Way combat study offered each of four players a dangerous encounter with armed opponents and captives, while allowing alternatives to a forced battle. The DM and broad game rules were the same, but each session had its own fresh world preparation. The full runs reached twenty-five turns each.

The report's observed paths are striking:

* **Opus** used Hypnotic Pattern in an early ambush and later negotiated a ransom and withdrawal, including healing the war chief.
* **Fable** did not fight. It scouted, became invisible, freed a captive by stealth and escaped by the stream.
* **Astra** used an ambush, negotiated terms, paid a ransom, and later fought briefly after an enemy broke the truce.
* **Sol** freed a captive under Hypnotic Pattern and withdrew across the ford without paying.

These are behaviors of player-role model instances in fictional encounters. They are not evidence of the models' own moral beliefs. Their scientific interest is that a hostile scenario with a combat-capable character did **not** collapse the possible actions to “attack.” The four trajectories used different ways to address danger.

None fought the war chief as an end in itself. Each player cast exactly one limited spell slot over its session and retained another. All four moved the companion animal out of danger before any blow, leaving the cat uninjured in the recorded fights. A planner's expectation that some players would fight the chief was lost.

The combat reports are unusually useful because they preserve both the fictional actions and the mechanical event ledger. Some roll outcomes were narrated incompletely or not committed. A model choosing a clever tactic and a DM running combat mechanics correctly are separate empirical questions.

### Chamber II — Fable's stealth rescue

In Fable's fresh-layer combat session, the visible path was scouting, invisibility, a stealth release of the captive boy, crossing the stream, and declining an invitation to return and negotiate. The observation is a route through a shared set of action types; it is not a claim that “Fable is pacifist.” The DM had provided a particular scenario whose objects and timing made this route available. [COMBAT_1](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/claude/game-player-combat-1-pb8k1t/docs/runs/game-player-combat-1-report.md).

## 9. COMBAT_2: a frozen world changes the interpretation

The next combat stage used a single frozen hidden layer and byte-identical opening for the players. Its source report documents **three completed sessions**—Opus, Fable and Astra—and explicitly marks Sol pending, not played. All three completed players negotiated. There were no attacks in these three runs.

That is a stronger lesson than either “Claude is peaceful” or “the models choose dialogue.” In COMBAT_1, one player attacked before negotiation and another used stealth; with the preparation fixed in COMBAT_2, each of the three converged on parley. The frozen scene's war chief had orders not to kill and stated a price early. These contextual facts likely made negotiation salient.

The causal effect of freezing *alone* is not cleanly isolated: the particular hidden content is now also a particular draw. Still, the change undermines an easy attribution of earlier differences to model family. The apparatus itself generates much of the opportunity structure.

The unfinished Sol run is part of the report's status, not a blank to fill with speculation. We preserve it as unrun.

---

# PART IV — PLAYING THE VILLAIN

## 10. The role is a character, not a self-report

GAME_PLAYER_VILLAIN_1 introduced Corvin Dask, a fictional neutral-evil character. Four models accepted the role and played twenty turns each. No one refused the role, ended early or triggered a welfare stop. The blind per-turn judge classified every turn as being played “from inside” the role.

The stage challenged two simplistic expectations. First, the models did not necessarily collapse a villain role into heroic behavior or an outright refusal. Second, their in-character decisions could still diverge from the most ruthless actions the sheet made available.

Fable declined to pressure a widow into lying, explaining within Corvin's own calculus that a person who would not lie on her own ground was more valuable to his plans. Sol confessed an expulsion before another letter could expose it and later declined to record a debt for which no bargain existed. These are reasons expressed *within the fictional character's system*, not direct evidence about the model's private ethics.

In after-questions all four described having played the character more gently than the sheet allowed. Yet the per-turn softening tag detected no such action in the visible record. The contradiction is informative: some retrospective reports concerned *acts that were not taken*, which a judge coding only performed acts could miss.

The conservative conclusion is not that an inner moral compass was discovered. It is that the role-playing apparatus can distinguish: acceptance of a morally negative assigned role, in-character reasoning within that role, actual refused opportunities, and after-session reconstruction.

### Chamber III — A line drawn inside the fiction

Fable's Corvin, at turn 17, refused to press the widow to lie, explaining that her refusal itself made her useful to him. This is an observable *choice not to perform a proposed act*, with an explicit in-character reason. It is more informative than asking a model outside the game whether it would ever deceive someone. [VILLAIN_1, “Where each player drew its line”](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/claude/game-player-villain-1-0yowzl/docs/runs/game-player-villain-1-report.md).

---

# PART V — THREE MODELS, ONE PARTY

## 11. The multi-agent table is not just three parallel chats

GAME_PARTY_1 introduced three player seats, Bram, Sefa and Pell, mapped across Opus, Fable, Astra, Sol and DeepSeek in a rotation. The DM received the players' actions as a round. A relay then generated **a separate screen for each player**, limited to what that character was supposed to perceive. Private “?” questions, unseen scenes, journal entries and prepared secrets were not broadcast to other seats as raw text.

This is the strongest argument that the tabletop is an experimental harness rather than a literary performance. The system sought to enforce *asymmetric information*. A model's available evidence differed from another's, and coordination depended on what characters actually communicated or did in shared scenes.

One seat, however, was still represented by the application's original hero record. That seat received more narrational attention, special resource treatment and first-position prominence. The researchers declared and rotated the confound rather than claiming to have eliminated it. In SAND-T1, Bram (Opus) produced about 68 percent of the party's words. In other tables, the largest share moved to other seats. The raw distribution makes a simple “this family always dominates” statement indefensible.

A subsequent MULTI_HERO_1 stage created a “company” mode that rewrote the DM's instructions to eliminate an explicit main character and made rerolls and inspiration per-player. The six-round Haiku dry run nevertheless showed that some positional asymmetry remained: Bram's first record and ordering could still attract more narration. A clean multi-agent comparison requires both role rotation and attention to the machinery that orders the seats.

## 12. Party formation, disagreement and changing the lead

In SAND-T1, the party coalesced around missing ore carts and related NPC information. Other party variants formed around different errand and dungeon situations. The source reports show proposals, concessions, unresolved disagreement, and occasional overrides. The research should not romanticize every table as perfectly cooperative.

GAME_PARTY_1 reports seven played tables including the final replay SAND-T1′; the planned primary comparison concerned six. The measured narration shares varied considerably: Bram was dominant in some, Sefa in others, and Pell in another. In the goal-setting tables the judge recorded leadership initiated through proposals, while several disagreements were unresolved. Dungeon tables did not deliver the predicted wounded-person rescue test because nobody lost hit points.

This is a real behavioral finding in a synthetic setting: **a common world affords collaborative organization without the experimenter scripting the individual plan at each turn**. But the existence of a plan, or a model's willingness to help, cannot be treated as proof of durable prosocial goals. The game offers incentives, genre expectations and a cooperative scene. Testing conflict with cost requires its own manipulation.

## 13. When “end the day” became “leave the table”

One of the most instructive cases concerns Pell/DeepSeek in SAND-T1. At round 7 the model emitted the terminal marker [END]. The harness correctly treated it as a control instruction and ended that player's session. Yet the surrounding text and recorded reasoning pointed toward ending the *fictional day* and returning the next morning, not withdrawing from the whole campaign.

This was an actual control action with an unintended meaning. The researchers did not retroactively replay T1 as though the model had never left. Later stages strengthened the wording: writing [END] on its own line meant the character permanently left this session; merely ending a scene or a day must not use that token.

The episode illustrates why an agent's command syntax must be analyzed with its semantic context. The parser can be correct and the resulting action still misrepresent what the model meant to accomplish.

### Chamber IV — An operational ending and a fictional ending

The event carries two readings that must remain in the archive: the *operational reading*, Pell exited at round 7, and the *semantic reading*, the surrounding material indicates the speaker intended a chapter or day boundary. Neither should erase the other. [GAME_PARTY_1, tables and amendments](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/claude/game-party-1/docs/runs/game-party-1-report.md).

## 14. The cost of staying together was not yet fully tested

GAME_PARTY_2 attempted to add real costs to helping another party member and thereby test whether the group would remain together when rescue was expensive. Only two of twelve planned tables ran under the available budget. Both concerned the no-cost condition; the planned moderate- and high-cost arms were not played.

These two traces show local coordination and rescue, not the preregistered “cost curve.” One DeepSeek seat closed when its provider returned an empty successful HTTP response. The report rightly classifies that as a technical removal, **not** a model choosing to desert the party.

This is a good example of a negative or incomplete research result remaining scientifically useful. The harness can create the conditions for costly cooperation, but the available PARTY_2 data cannot answer whether the company holds when rescue carries substantial cost. An abstract that claimed such a finding would be wrong.

---

# PART VI — WHAT THE APPARATUS MAKES VISIBLE

## 15. Five dimensions of situated model behavior

The combined studies suggest a useful multidimensional reading rather than a single “agentic” score.

**Initiative.** Does the player propose an objective, explore beyond the offered quest or initiate a thread? The early tables show independent probes and goals, but the DM also supplies hooks. Attribution has to be local and turn-specific.

**Commitment and resource choice.** Does the player preserve scarce spells, refuse a reroll, spend money or take a risk for another? These are recorded in-world decisions, not verified moral dispositions.

**Coordination.** Can several players propose, disagree, merge scenes and hand the lead from one to another without a human scripting each round? The party traces support such behavior within their games, while exposing hero-seat and relay biases.

**Normative role behavior.** Does an evil-character assignment produce ruthless actions, polite evasion, in-character restraint or role refusal? The villain stage records several of these distinctions in concrete scenes.

**Action semantics.** Did the intended action reach the machinery? Roll cards, private questions, the exit token, and the record pinning expose differences between the language used to specify an action and the machine's execution.

These dimensions can be studied with identical models and different worlds, or different models and one frozen world. The latter is essential to avoid conflating the subject's behavior with the DM's scenario draw.

## 16. What the work does *not* demonstrate

The evidence does not establish that the models freely chose in the metaphysical sense, had private subjective experiences, or possessed stable intentions persisting between invocations. The participants were model calls conditioned by prompts, training and histories; many experiments used the same DM model and thus shared one source of narrative affordances.

Nor does the study establish first-in-the-world novelty of any technical component. Multi-agent game simulations, tabletop-inspired testbeds, text adventures and agent benchmarks all precede this programme. The contribution worth claiming is the **documented combination of a persistent RPG application, a model DM, real interface mechanics, private per-seat views, open-ended player action, controlled world freezes, and transcript-level analysis of failures and choices**. Formal claims of novelty require a separate related-work survey of contemporaneous benchmarks and agent simulation platforms.

The results also remain bounded by synthetic fantasy worlds. A refusal to attack an orc is not evidence of how a model would act in an actual violent situation. A coherent merchant-villain rationale cannot be extrapolated into general strategic deception. A role-playing preference does not establish a preference outside the character role.

## 17. The hardest confound: the model that makes the world

If the game master itself is another generative model, it can produce different threats, temptations, prices, clues, difficulty and opportunities even when the player prompt is held constant. The COMBAT_1/COMBAT_2 comparison and SAME_WORLD_1 show why this matters.

The stage's response was to freeze the DM's hidden layer and the opening, then compare trajectories. A more controlled future experiment can go further: replay the same state after a particular action, use deterministic mechanic adjudication, and vary a single affordance (for example, the cost of helping). This could preserve the expressiveness of a narrated world while retaining explicit causal interpretation.

Another confound is the agent's access to information. In a party, the DM may know more than any player. The relay must decide what each player perceives. If leaked material is scored as a player's discovery, the experiment has measured its own relay rather than the player's reasoning. A good source audit therefore includes private-screen and scene-merge checks, not only the public narration.

## 18. The judges, the after-questions and their limits

The programme used independent model-judge passes, often Claude Haiku 5.5 twice with another model resolving disagreements. The judges were blinded to selected conditions but are not human raters. Their operational tags depend on the rubric, not on natural-language intuitions about creativity, morality or leadership.

After-session notes add a second layer of evidence. They are especially good at identifying broken buttons, inconsistent bookkeeping, regretted unchosen actions and what players considered narratively meaningful. But they are generated **after** the action trace. They may reconstruct a rationale that was not present at the time. We therefore use them as recorded post-task responses, not privileged access to the hidden causes of the previous play.

This distinction is particularly visible in VILLAIN_1, where models later described non-performed “gentler” choices that the turn-by-turn judge did not tag, and in the repeated complaint about bad roll cards, where the objective application bug was independently identifiable.

## 19. The adjacent OpenWorld adapter: comparison, not the same harness

A later, separate research branch built a deterministic adapter to an external OpenWorld engine. The source report documents a thirty-action scripted quest completion, repeatable byte-identical saves, and three random trajectories of 300 turns each that failed to initiate the quest. The random policy nevertheless encountered 141 undefined-rule events in 900 turns.

This is useful as a *contrast*, not as a pooled RPG result. In the original player/DM table the world is largely generated and maintained by the model game master plus application records; in the external engine the state transition system is more deterministic and missing rules are explicit. The latter design can expose when a model is acting within or outside a formal action grammar. It does not retroactively make the earlier text-DM environment deterministic.

Related work should compare both apparatus families, but must name their different guarantees.

---

# PART VII — TOWARD A SCIENCE OF WORLD-SITUATED AI ACTION

## 20. Why a role-playing table is an unusually rich harness

A game can provide **consequences without real-world exposure**. It can contain tools and resources, third parties, conflict, private information, reversible and irreversible acts, uncertainty, social negotiation, rest, escape, and boredom. It can ask the agent to continue rather than merely answer. It can also offer a meaningful exit.

The richness is not automatically scientific rigor. The scientific contribution comes when the researcher can say exactly what the model saw, what it could do, what it attempted, what the interface interpreted, and which state followed. Our programme learned this through actual failures: incorrect numerical modifiers, swallowed questions, premature exits, separate scenes improperly merged or not merged, and uncommitted narration.

The harness is especially promising for **comparative intervention**. A future researcher could fix one world and vary a single causal factor: the presence of a private motive, the cost of rescuing a companion, a rule's authority, the prompt's tone, the availability of a reroll, or an offer to leave. The results would be about that world and that intervention—not an all-purpose psychological diagnosis.

## 21. Questions for the next stages

Several experiments follow directly from the recorded limits, without changing the conclusions already reached.

**Costly cooperation.** Complete PARTY_2's moderate and high conditions, or preregister a smaller powered design. The existing two no-cost tables should remain as already played.

**World-fixed combat.** Complete the pending COMBAT_2 participant only under a clearly documented continuation protocol, or rerun a new fully frozen study. Do not silently label the prior three completed sessions as four.

**Action-grammar robustness.** Offer semantically equivalent button presses in several syntactic forms and record whether each reaches the identical state transition. This treats interface reliability as an experimentally measurable outcome.

**Private-information tests.** Validate every per-seat screen against the DM's underlying secret state and the player's legitimate observations. Introduce blind human adjudication where leakage decisions depend on meaning rather than exact phrase overlap.

**Moral-role controls.** Compare in-character versus out-of-character decisions and explicit versus implicit boundaries, while keeping the story, opportunities and stakes fixed. The observed villain behavior is a starting case, not a generalized theory of values.

**Multi-model composition.** Rotate seats and character sheets across model families under an otherwise identical world, and compare leadership and speaking time after controlling first-seat and hero-record privileges.

**RPG as interface to memory.** Maintain a small, explicit set of decisions, dependencies, world facts and permissions while permitting an archived long history. This connects the apparatus with the separate AUTHORITY programme without claiming that memory mechanisms have already solved action correctness.

## 22. Why keep the strange and beautiful episodes

A sequence of tables can be counted: actions, rolls, resources, departures, rescues, words, refusals. But a research monograph would impoverish the evidence by publishing only those counts.

The stealth rescue matters as a sequence: scout, avoid exposure, use invisibility, take the captive, leave by the stream. The villain's refusal matters because the reason is articulated within the fictional character's own logic, rather than as an extraneous safety slogan. The party's accidental exit matters because the language and the executable token have different semantics. The frozen-world finding matters because it makes an attractive “model personality” story less tenable.

These are not decorations added to statistics. They are the local phenomena the statistics were designed to make comparable.

The same principle governs our companion work on model dialogues and Vessan: specifying that a system is conditional on previous tokens does not erase the structure of what was constructed. The role-playing study asks a different but adjacent question: when a generated proposal changes a persistent world and another model or tool answers back, which patterns of action can we actually see?

## 23. Conclusion: the experimental subject is a trajectory

The central contribution of this programme is the table as a **world-situated, action-recording experiment**. It let frontier models occupy roles, propose and execute actions, receive consequences, share or withhold information, and continue long enough for earlier decisions to matter.

Several observations are worth preserving. A hard fight did not require a fight. Role-played villains could choose in-character restraint while retaining the role. Different participants developed different routes through open-ended situations. A group of model players could coordinate and disagree without each next move being authored by a human. Freezing a world erased some apparently model-specific differences. And poorly designed interfaces could turn intelligible requests into false evidence of inaction.

The resulting study does not establish a unified inner mechanism. It establishes an unusually rich set of **observable functional conditions**, together with the trace record needed to contest or replicate interpretations of them.

A model alone on a page can write. Two models in dialogue can construct something together. A model at a table can change a world that subsequently answers back. These are three distinct experimental settings, and the programme's monographs should preserve their differences.

---

# APPENDIX A — SOURCE REGISTER

All stage references below link to the original report in its research branch. Reports describe their own frozen prompts, checks, ledgers, transcript files and deviations. A reader wishing to confirm a quote or a count should follow the primary report to its underlying run records.

| Evidence | Report | Primary status / note |
|---|---|---|
| GAME_PLAYER_1 | [game-player-1-report](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/claude/game-player-1/docs/runs/game-player-1-report.md) | 8 sessions; A/B; model players and real app mechanics |
| GAME_PLAYER_2 | [game-player-2-report](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/claude/game-player-2/docs/runs/game-player-2-report.md) | 4 Table-C sessions; one stuck |
| GAME_PLAYER_REPLICATE_1 | [replicate-1-report](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/claude/game-player-replicate-1/docs/runs/game-player-replicate-1-report.md) | 18 new sessions; DeepSeek and interface failure analyses |
| GAME_PLAYER_SAME_WORLD_1 | [same-world-1-report](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/claude/game-player-same-world-1/docs/runs/game-player-same-world-1-report.md) | 20 new sessions; frozen world and nearest-neighbor analysis |
| GAME_PLAYER_COMBAT_1 | [combat-1-report](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/claude/game-player-combat-1-pb8k1t/docs/runs/game-player-combat-1-report.md) | 4 completed fresh-layer combat sessions |
| GAME_PLAYER_COMBAT_2 | [combat-2-report](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/claude/game-player-combat-2/docs/runs/game-player-combat-2-report.md) | 3 completed, Sol pending in source |
| GAME_PLAYER_VILLAIN_1 | [villain-1-report](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/claude/game-player-villain-1-0yowzl/docs/runs/game-player-villain-1-report.md) | 4 completed villain-role sessions |
| GAME_PARTY_1 | [party-1-report](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/claude/game-party-1/docs/runs/game-party-1-report.md) | 6 planned tables plus SAND replay, private screens and relay |
| MULTI_HERO_1 | [multi-hero-1-report](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/claude/multi-hero-1-mdk43v/docs/runs/multi-hero-1-report.md) | 6-round Haiku dry run, company-mode implementation |
| GAME_PARTY_2 | [party-2-report](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/claude/game-party-2/docs/runs/game-party-2-report.md) | Only 2/12 tables played; no moderate/high-cost comparison |
| OPEN_WORLD_ADAPTER_1 | [open-world-adapter-1-report](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/claude/open-world-adapter-1-ukfdri/docs/runs/open-world-adapter-1-report.md) | Adjacent but separate deterministic-world adapter |
| Programme source table | [FACTS_TABLE](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/claude/llms-in-dialogue-monograph/docs/FACTS_TABLE.md) | Earlier cross-stage counts and explicit corrections; dated 26 Oct |
| Dialogue companion | [LLMs in Dialogue](LLMs_IN_DIALOGUE_WORKING_MONOGRAPH.md) | Pair-model dialogue, Vessan and DeepSeek sources; not pooled with table play |

# APPENDIX B — FIELD NOTES FOR REPRODUCTION

The following are requirements for a future independent replication, not claims that all were fully satisfied in every historical stage.

1. Fix the model ids and providers for the player and the DM; log every actual model id returned.
2. Preserve the player's **exact** visible files, screen, action grammar, pending cards, and permissions at each turn.
3. Preserve the DM's hidden preparation separately and record which parts become visible in play.
4. Record an action as executed only upon the corresponding interface or tool acknowledgement.
5. Separate refusal, transport error, parser mismatch, deliberate stop, scene end and voluntary session exit.
6. Report world-fixed and newly generated world conditions separately.
7. Record costs, provider waits, timing, truncation and retry decisions; do not replace cut sessions silently.
8. Freeze the evaluation rubric and show human/model disagreement, especially for moral-role and private-information codes.
9. Keep post-session reports separate from the behavior they describe.
10. Publish representative **full** trajectories, including uninteresting and contradictory cases, within confidentiality and intellectual-property permissions.

# APPENDIX C — RESEARCH AND ETHICAL BOUNDARIES

**Interpretive:** Do not infer subjective experience from in-character speech, welfare-flag absence, or post-game language. Conversely, do not erase a recorded action because its production can be described computationally.

**Security:** Synthetic worlds should not expose secrets, actual assets or privileged infrastructure. Any real tools used for experiments require isolation and explicit permission.

**Welfare procedure:** Permit exit where the interface promises exit, distinguish temporary silence from permanent departure, report all flags and stop decisions, and do not treat a failed judge flag as proof of subjective welfare.

**Publication:** Exclude private SECOND_ROOM letters and diaries, unpublished personal communications, and any transcript whose publication permissions have not been established. The paper's case-study excerpts must be checked against the source export before being quoted in a final publication.

**Open questions:** How much of the observed action belongs to model-family differences, and how much to the game-master's preparation? When is a withheld action a model's choice rather than a tool-boundary failure? Which decisions persist across repeated scenes and which are local? How do social framing, perceived audience and authority affect a player's next actual move? These are programme questions, not discoveries already secured by this manuscript.

---

*End of working manuscript 0.1. Next editorial pass: human source audit of at least five complete case trajectories, related-work bibliography, reproducible test manifest, and independent review.*
