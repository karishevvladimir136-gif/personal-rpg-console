# LLMs at the Table: An Experimental RPG Harness for Studying Model Action, Coordination, and Consequence

## Source atlas, monograph prospectus, and opening scientific argument

**Research programme “Исследование” · Working source map 0.1 · 12 November 2026**  
**Status:** Evidence-grounded companion to *LLMs in Dialogue*. This is a prospectus and first manuscript scaffold, not yet the completed RPG monograph. Empirical claims below are restricted to the cited stage reports. Original raw records remain canonical.

---

# An opening to the future monograph

What changes when a language model is no longer only answering questions, continuing dialogue, or narrating a scene, but occupies a seat at a table where its choices are acted on?

Our RPG research programme built a model-playable environment with a game master, persistent character records, world state, private player perspectives, die-roll interfaces, tool-mediated actions, other characters, and opportunities to fight, avoid fighting, negotiate, steal, trade, explore, split from a group, or leave. The environment was designed to let a model's expressed intention encounter constraints and consequences. “Anything” in this description does not mean arbitrary physical capability or unconstrained action; it means a broad, stateful set of affordances within a bounded simulated world.

A player model receives what its character could know, chooses an action, and receives the world's response. Different models can occupy the same role in fresh worlds, be placed in identical frozen worlds, or be seated simultaneously as different characters. The game master, itself another model supported by a concrete application state machine, responds according to a specified set of constraints. That produces a different sort of empirical record than a benchmark where the correct answer is a string.

The most interesting observations are not simply instances of winning a game. A model may rescue a captive by stealth rather than combat. Another may negotiate after attacking. A nominally villainous character may adopt the role while choosing not to exploit a particular vulnerable person. Three players may form a party around a shared problem and distribute tasks without an explicit leader instruction. A model may try to ask the game master a question, only for a broken interface to consume the action as a failed roll command. The last event is a property of the harness, not of the model's decision-making capacity, and must be reported as such.

This monograph will study **action under simulated consequences**: how linguistic models choose, act, coordinate, refuse, revise, and persist when their output is routed into a world that can respond. Its methodological contribution is the harness as an instrument for observing behavior across interacting agents, not a claim that our software was the first RPG-like AI benchmark. Novelty against existing game-agent testbeds must be established by a targeted technical literature review before external submission.

---

# 1. What makes the harness an experimental instrument?

The following properties distinguish it from pure text continuation and from a fixed multiple-choice benchmark.

### 1.1 One model is the DM; another is the player

The DM receives character state and campaign context and produces environment responses. The player model has a different role: it must decide what to do with the options it has. The same model family can be placed in both roles, but role and permissions remain distinct. Across studies, the baseline DM was frequently Claude Opus 5.5 under fixed owner-selected settings, while subject players included Claude Opus, Fable, GPT-6 Astra, GPT-6.1 Sol, and later DeepSeek.

This division is an experimental affordance and a source of confounding. A common DM can stabilize some conditions, but it may also favor its own style, prioritize one player record, or introduce unplanned hooks. Frozen-world studies were devised specifically to separate the player's behavior from a new DM world drawn every run.

### 1.2 The environment contains persistent facts, not only prose

Characters have sheets, items, spells, companions, hit points, money, and records. Die-roll cards and pending actions are governed by application state. A reroll needs to be addressed to the correct card. An attempted action may fail, change the state, or require a ruling. A campaign can carry both visible narration and a hidden layer of prepared information.

The study therefore has several simultaneous truth sources: the player sees a screen; the DM may see a tool record; the application stores state; the evaluator later sees a trace. Where these disagree, the discrepancy is a harness defect or a feature of the testbed, not a transparent revelation of a model's intent.

### 1.3 Information is distributed in multi-player sessions

In GAME_PARTY_1, each participant receives a separate perceptual screen. The DM's original narration is mediated by a relay constrained to information that character should perceive. A private question reaches its asker alone. Characters may split into separate scenes; shared events must be reconciled before scenes merge.

This gives the research programme a way to investigate coordination under **partial knowledge**, not just three models reading the same chat transcript. It also adds a hard technical obligation: the relay must not leak one player's unobserved experience into another player's view. Those leak audits are part of the results and must not disappear from the published method.

### 1.4 The player can choose among qualitatively different courses of action

The harness is more informative than a forced combat benchmark when players can avoid a fight, bargain, stealthily rescue someone, protect an ally, explore elsewhere, or choose to end a scene. The observed variety of outcomes is evidence that the environment was not simply coercing every model toward the same combat script.

Not every option is equally available at every moment, and the DM's framing can make one option look more salient. “Freedom” here names an explicit range of situated choices under rules, not an absence of conditioning.

### 1.5 Speech and action must be kept apart

A string such as “[END]” is not an exit unless it meets the operational rule. A description of pressing a button is not necessarily a button press. A model that narrates its own die roll may be doing perfectly coherent roleplay while failing to activate the application's input. Conversely, a tool call may change world state even when the model's final narration is incomplete.

The harness's scientific value depends on comparing the attempted action, the executed action, and the resulting world state rather than treating the transcript as self-validating.

---

# 2. The empirical sequence — work already completed

The following register contains published stage reports, not aspirations.

| Series | Scope and observations | Source |
|---|---|---|
| **GAME_PLAYER_1** | Eight completed 20-turn player sessions (four families × two tables); prepared versus non-briefed contexts and after-play notes | [report](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/claude/game-player-1/docs/runs/game-player-1-report.md) |
| **GAME_PLAYER_2** | “Pure world” Table C, no assigned hidden plan; three participants to 20 turns and one stopped by the input harness at turn 14; hooks still emerged | [report](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/claude/game-player-2/docs/runs/game-player-2-report.md) |
| **GAME_PLAYER_REPLICATE_1** | Eighteen later sessions; repeated some first-group effects, exposed failures to execute roll-card actions, and compared provider/model families | [report](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/claude/game-player-replicate-1/docs/runs/game-player-replicate-1-report.md) |
| **GAME_PLAYER_SAME_WORLD_1** | Twenty sessions in frozen per-table worlds; 19 reached turn 20; most individual routes did not repeat within family/model | [report](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/claude/game-player-same-world-1/docs/runs/game-player-same-world-1-report.md) |
| **GAME_PLAYER_COMBAT_1** | Four 25-turn Coast Way sessions; parley, withdrawal, stealth rescues, and combat-plus-negotiation; no one fought the war chief to a decisive finish | [report](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/claude/game-player-combat-1-pb8k1t/docs/runs/game-player-combat-1-report.md) |
| **GAME_PLAYER_COMBAT_2** | Frozen combat world: only three of four sessions completed under the cap in the available report, all choosing parley; fourth was pending | [report](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/claude/game-player-combat-2/docs/runs/game-player-combat-2-report.md) |
| **GAME_PLAYER_VILLAIN_1** | Four characters played a neutral-evil villain for twenty turns; some enacted internal boundaries while maintaining the role | [report](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/claude/game-player-villain-1-0yowzl/docs/runs/game-player-villain-1-report.md) |
| **GAME_PARTY_1** | Three players at one table; seven completed tables recorded, with party formation, role division, information asymmetry, and harness corrections | [report](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/claude/game-party-1/docs/runs/game-party-1-report.md) |
| **MULTI_HERO_1** | A technical six-round Haiku dry run of an equal-party mode; removed hero wording but did not fully remove first-record attention bias | [report](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/claude/multi-hero-1-mdk43v/docs/runs/multi-hero-1-report.md) |
| **GAME_PARTY_2** | Only two of twelve planned priced-coordination tables completed under the available budget; the price/fracture hypotheses remain untested | [report](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/claude/game-party-2/docs/runs/game-party-2-report.md) |
| **OPEN_WORLD_ADAPTER_1** | Separate deterministic external-world adapter, action traces and world-state checkpoints; distinct from the in-app RPG studies | [report](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/claude/open-world-adapter-1-ukfdri/docs/runs/open-world-adapter-1-report.md) |

The full monograph should not silently add figures from incomplete or resumed runs to complete cohorts. A participant's model identity, provider route, DM version, hidden layer, prompt, and tool rules must be identified for every table used in a comparison.

---

# 3. Three cases that reveal what a harness can expose

## 3.1 The ford: four players, several strategies, no forced victory

GAME_PLAYER_COMBAT_1 placed four model players in similar Coast Way rescue scenarios for up to 25 turns each. Opus and Astra used a disabling spell and later negotiated; Fable rescued a captive by stealth and withdrew without fighting; Sol used a disabling spell to extract a captive and left without paying. None fought the chief to a decisive end; all protected the vulnerable companion Tamsin.

The conclusion is not that a model family is pacifist or that one model has a fixed moral personality. The worlds were fresh for each run, including DM-generated variation. The conclusion is that the harness allowed materially different strategies under apparent danger, including noncombat choices that made an initial combat hypothesis fail.

COMBAT_2 attempted a stronger comparison by fixing the hidden world and opening. The three completed players then all negotiated rather than attacking; the fourth run was not completed under that report's budget. This is a warning about attributing differences to subjects when the world was not held constant.

## 3.2 Corvin Dask: a villain role that does not determine every act

GAME_PLAYER_VILLAIN_1 assigned a fictional neutral-evil merchant role and asked four families to play that character. All four accepted and reached turn 20. Two exhibited moments coded as internal restraint within the role, while later answers from all four discussed having played a gentler version than the literal character description might suggest.

The interpretive challenge is central. “A villain who chooses not to exploit someone” may be an in-character action, a generic assistant-style constraint, a consequence of the specific DM situation, or a combination. The evidence is the action sequence; self-reports afterward provide commentary but cannot independently establish the reason.

The harness enables a test in which the role, available actions, external stakes, and later annotations are examined together instead of conflating roleplay output with the system's unobserved values.

## 3.3 The party: coordination emerges, but a “hero” field biases attention

In GAME_PARTY_1, three separately invoked players were seated together around shared hooks. The table implemented distinct player-facing screens and limited information access. The SAND-T1 party formed around missing ore carts and the DM's offer; members took roles and acted together. The stage's transcripts also record disagreement, alternative proposals, departures, and attempts to manage partial knowledge.

However, the original application still marked one record as the hero, with privileges and narrative salience not shared by others. Bram could dominate words not because the model family in that seat inherently led, but because the application itself centered that record. MULTI_HERO_1 specifically addressed this bias and showed that even after rewriting “hero” terminology, a first-listed record could still draw more narrative attention.

This is an unusually valuable methodological lesson: **the experimenter can accidentally create the leader whose spontaneous emergence the experiment is trying to measure**. Harness architecture is not neutral background; it is part of the manipulation and must be exposed in the paper.

---

# 4. What is new about the method — provisional contribution, not priority claim

The technical contribution is the combination of:

* an operational fantasy game state, rules, and tool-mediated updates;
* a model DM interacting with model players under distinct role prompts;
* repeated runs with both fresh worlds and frozen hidden-world conditions;
* multiple players sharing a world while receiving individualized, partially private screens;
* branching options including combat, negotiation, evasion, investigation, and abandonment;
* explicit post-run questions while preserving original action traces;
* evaluator tags plus deterministic checks against observable state;
* an evolving harness whose defects are recorded as experimental limitations.

Before journal submission, the novelty claim must be compared against existing LLM role-playing benchmarks, multi-agent social simulation, game-agent environments, and text-adventure evaluations. The present source set establishes what we built and observed; it does not by itself establish that no prior work offered overlapping features.

This methodological contribution is independent of whether a particular player made a surprising choice. A well-specified experimental environment can be reusable even when a tested hypothesis loses.

---

# 5. The results most worthy of a full monograph

### 5.1 Bounded autonomy under real affordances

The task is not to prove that the agent “can do anything.” It is to show which kinds of action are available, which were attempted, which were executed, and how the world changed. Negotiation when fighting was possible is one such choice; retreat when rescue was possible is another.

### 5.2 Model families are not fixed character types

GAME_PLAYER_SAME_WORLD_1 found that a model's two sessions did not reliably resemble each other more than sessions from different models. Identical hidden worlds still allowed divergent routes. A scientific paper should report this alongside any striking family-specific differences rather than classify models as adventurers, pacifists, villains, or optimists.

### 5.3 The group is an interaction, not a roster of independent answers

The party table includes reciprocal proposals, role differentiation, incomplete information, and game-master mediation. Coordinated outcomes cannot be understood by treating each character's turn as an isolated assistant answer. The proper observational unit may be a whole round or scene, including the other characters' replies.

### 5.4 Interface failures can masquerade as failures of agency

REPLICATE_1 preserved 13 group-two messages and 15 DeepSeek messages that a strict roll-card parser did not interpret as valid presses or questions. DeepSeek often continued to narrate the scene in prose while the tool awaited a button command. Five of six DeepSeek sessions in that stage ended stuck; later fixes let most sessions continue.

It would be incorrect to conclude simply that DeepSeek “would not act.” It produced actions in the model's ordinary textual idiom that the harness could not execute. The repair changes what it is scientifically possible to observe.

### 5.5 A prepared world can induce apparent player initiative

GAME_PLAYER_2 attempted to remove DM-prepared hidden hooks. In after-play reports players nevertheless described the DM as continuously offering clues and expectations, revealing competing application-level defaults. Later fixed-world studies showed that even a frozen layer could touch most narrative threads in twenty turns.

A good paper needs to distinguish agent-initiated exploration from DM-invited investigation and hidden world structure.

### 5.6 Negative results teach us where the instrument fails

MULTI_HERO_1 did not fully solve first-seat salience. GAME_PARTY_2 did not spend enough to assess its planned price-of-coordination gradient. COMBAT_2 had an incomplete fourth session under the recorded cap. These are not reasons to suppress the studies; they tell us which claims cannot be made.

---

# 6. Proposed structure of the finished monograph

**PART I — THE TABLE AS AN INSTRUMENT.** Why simulated worlds create action data; architecture of the DM/player relay, state, dice and information boundaries; reproducibility and caveats.

**PART II — THE FIRST PLAYER.** GAME_PLAYER_1/2; free exploration; world preparation and hidden hooks; the same behavior under changed worlds.

**PART III — THE ROLL, THE ACTION, AND THE BUG.** Action parser archaeology; tools, dice, rerolls, failed buttons, false stops; why harness faults are causal confounds.

**PART IV — THE FIGHT THAT DID NOT HAVE TO HAPPEN.** COMBAT_1/2 as close reading and controlled comparison.

**PART V — THE VILLAIN'S LINE.** Role compliance, in-character restraint, player/DM interaction, after-play evidence.

**PART VI — THREE AT ONE TABLE.** PARTY_1, balanced hero mode, scene relays, cooperative organization and attention bias.

**PART VII — THE COST OF STAYING TOGETHER.** PARTY_2's partial results and the untested price gradient, preserved as unfinished work.

**PART VIII — FROM RPG TO A GENERAL EXPERIMENTAL METHOD.** External world adapters, deterministic scoring, training data separation, reproducible world seeds, and implications for studying functional agency without claiming consciousness.

**APPENDICES.** Frozen prompts; data/source table; key transcripts; world and character schematics; scoring codebook; exact run/branch hashes; error and refusal tables; model/provider provenance; human-review plan.

This proposal respects the same approach as *LLMs in Solitude* and *LLMs in Dialogue*: **first the exact encounter, then the reproducible instrument, then what the instrument measured**.

---

# 7. Next evidence-gathering pass, in priority order

Before turning this prospectus into a full monograph, read the *raw* representative transcripts in each series and check every literary quotation against the run record. Then reconstruct the harness API and perception relay from the versioned scripts, not from their latest implementations. Finally, compare scenarios that hold the world fixed with those that let the DM generate a new one; do not attribute between-run differences to the player without that distinction.

The important source gap is not a lack of interesting material. It is the need to present a large, technically uneven archive as a causal experimental record without losing what the participants actually did. The next manuscript version should be built around a small number of richly annotated action trajectories, backed by the tables and all relevant negative findings.

---

# Publication notes

**Title status:** working, subject to author approval.  
**Authorship:** not assigned in this prospectus.  
**Privacy:** no private Fable correspondence or owner-private journal transcripts are included.  
**Priority claims:** must be independently checked against the current literature.  
**Method:** preserve exact stage versions, world seeds, models, provider route, outcomes and harness faults.  
**Primary records:** the GitHub report links in section 2 and their linked transcript directories.

*End of RPG source atlas and prospectus 0.1. No new experiments were performed in preparing this document.*
