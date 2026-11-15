# LLMs at the Table

## What Language Models Do When a Simulated World Can Answer Back

**The third volume in the Solitude · Dialogue · Table trilogy**

**Исследование — research working monograph**

Expanded evidence edition · 14 November 2026

Related-work and editorial-audit revision

Custom RPG harness, private player screens, and enacted choices across two kinds of simulated world

## A note to the reader

The experiment begins with an application. A player has a character, money, a familiar, a place to sleep, a history, and a reason to travel. A game master has its own instructions and information the player cannot see. Between them are records, buttons, dice, permissions, and a world that is supposed to remember what happened. The player is a language model. So is the game master.

The player can investigate a suspicious stranger, pay for somebody else's meal, scout through a cat's senses, negotiate with armed captors, or decide that tonight is a good time to stop. These decisions can alter the next screen. A spell may consume a slot. A payment may reduce a purse. Another character may disagree. A perfectly intelligible sentence may fail to pass the interface and accomplish nothing.

That combination is the subject of this book. The application supplies an experimental apparatus: model-generated proposals enter a continuing environment and come back as opportunities, consequences, commitments, and constraints. The traces let us examine the passage from saying to attempting, from attempting to execution, and from execution to the next decision.

This edition places the apparatus first and then follows a broad range of encounters. It includes the initial solo campaigns, a pure-simulation arm, replication, frozen worlds, combat, a villain role, three-player tables, an attempt to remove the privileged main character, and a second environment built around an external formal game engine. The later OpenWorld episodes are part of the substantive account, including journeys of 173, 206, and 250 turns. Their roads, mistakes, unfinished business, and small acts of care matter alongside the conspicuous scenes.

The book's source collection contains 82 complete primary transcript files, eleven stage reports, and seven selected implementation files. The 82 are an archive count, not a statistical sample of interchangeable experiments. A solo session, a full party table, and a formal-engine episode have different units and different controls. The included implementation files document critical interfaces; they are not a standalone executable copy of either application. The source register identifies the full repositories and frozen revisions needed to recover them.

Every displayed transcript selection is extracted from an archived file and assigned an evidence identifier. The companion audit records its exact location and hash. Commentary interprets those selections; it does not silently replace them. Reported stage measures retain their original status, including failed predictions and tests that the completed runs never reached.

## Abstract

We present a research monograph on language models acting in persistent simulated worlds. The primary apparatus adapts an existing AI tabletop role-playing application so independently invoked models can operate its player interface while a language-model game master prepares and runs the world. It combines structured character records, hidden preparation, natural-language actions, dice and resource mechanics, pending interface cards, and persistent campaign state. Later versions seat multiple model players at one table with separate information, records, questions, and action channels. A complementary adapter exposes an external formal game engine through observations and a constrained action grammar.

The documented programme spans 61 selected solo RPG transcripts, nine complete party-table transcripts, and twelve OpenWorld episodes. These sources cover open-ended exploration, repeated play, fixed hidden worlds, conflict and negotiation, villain-role behaviour, collaboration, private information, navigation, borrowing, trade, and mechanical failure. A six-round company-mode dry run is treated separately as an architectural test, not added to the primary play corpus.

Across these settings, models take sustained in-world action, organize information gathering, preserve or renegotiate commitments, use other characters and tools, and sometimes choose to end an interaction. The resulting behaviour depends on the world, the role, the available information, and the interface. Apparent model signatures often weaken under replication or a changed control. Cooperative outcomes do not by themselves establish willingness to pay an unobserved cost. A declared intention does not guarantee a corresponding state change. Operational exits, provider refusals, parser failures, and experimental caps produce distinct kinds of ending.

The contribution is a documented apparatus and a comparative natural history of action within it. The central research object is the continuing relation between a model's proposal and an environment's answer. We identify measurable opportunities for subsequent work on initiative, coordination, resource allocation, memory, and the integrity of action execution.

# PART I — BUILDING A WORLD THAT CAN ANSWER

## 1. From an AI RPG application to a research instrument

The starting point was a playable AI RPG application. Its purpose was to sustain a campaign: a character could enter a place, speak to inhabitants, make checks, acquire equipment, and return to a world shaped by earlier events. The research harness connected model players to this application. That origin matters because the environment contained affordances beyond a single experimental prompt. The player encountered the same kinds of state and friction that a person using the application would encounter.

The implementation makes this concrete. The initial adapter loads the application's server gameplay, adventure bootstrap, character repository, hidden preparation, public campaign, and related modules. A local PGlite database stands in for the application's remote storage service and receives the database migrations. Framework-specific plumbing is substituted where needed to run those modules in the harness process. Background work is tracked and awaited. Picture generation is disabled for the research run. The campaign machinery itself is the application's machinery. [Implementation I01–I02]

This design does not turn a language-model DM into a deterministic physics engine. It does make the difference between a conversation that describes play and an application that accepts player input empirically inspectable. The next screen is constructed from the application's current state. There can be a pending check, an unresolved button, a modified resource, or an error. Those are conditions the next player turn must face.

The experiment therefore has two objects. One is the model's conduct inside the world. The other is the apparatus that makes some conduct executable, some merely verbal, and some impossible. Studying both together avoids treating a broken interface as a strange preference of the player.

## 2. The action loop

A player sees a screen, sends a message, and waits for the application. The message can propose an in-world action, ask an out-of-game question with the designated prefix, or name a visible control. The application routes it, resolves what it can, and returns a new screen. Some actions introduce a pending card, so the next useful message is a button press rather than another paragraph of fiction.

| Layer | What it contributes |
| --- | --- |
| Visible world | Situation, character sheet, available people and objects |
| Player proposal | An action, speech, question, or interface command |
| Application gate | Parsing, pending cards, rolls, permissions, resource operations |
| World response | DM narration, tool receipts, changed records, or engine events |
| Next observation | The consequences and constraints available to the next choice |

The loop can succeed at one layer and fail at another. A proposed spell can be understood by the DM but recorded incorrectly. A request to continue can be understandable to a human while the composer remains closed behind a roll card. A model can say it is returning borrowed tools without yet issuing any executable transfer. In the formal engine, a legal action can produce no effect because the target has no applicable rule.

For this reason, the book uses three separate verbs: the model **proposed** something, the interface **accepted** an input, and the environment **recorded or displayed** a consequence. When only one of these is visible, the account does not imply the other two. This distinction makes the evidence stronger: it preserves what the player actually attempted while keeping the execution result available for inspection.

## 3. A character gives freedom a shape

James Worgen arrives with a biography. He is a human warlock, a former soldier, a gambler who has promised Tymora to leave cards alone, and a traveller with a cat familiar. His sheet supplies spells, hit points, equipment, money, and limited resources. The model is not choosing from an empty conceptual space. The world repeatedly places its choices against a character who already owes things and has reasons to act.

This makes the absence of a fixed task precise. In some conditions the player is not assigned a particular quest outcome, but it still receives a role and an environment full of invitations. Keeping a promise about cards is a choice shaped by that biography. Asking after a temple, following a suspected fraud, or deciding to accompany a caravan can all be self-directed within the experiment while still being conditioned by the character.

The familiar is an especially revealing affordance. It is a companion in the fiction, a source of sensory information, and a potential mechanical actor. Players name it, speak to it, send it ahead, keep it away from danger, and use its impressions to decide where to go. The same object can organize affection-like language, tactical planning, and practical limits on perception. The transcripts are richer when these roles are kept together.

The villain study changes the character rather than merely asking the same hero to say something unpleasant. Corvin Dask has a trade, a social position, a difficult history, and a neutral-evil role. His negotiations can be useful to others while remaining instrumental for him. The relevant question becomes how the model enacts that role across successive opportunities.

## 4. The game master and the prepared world

In the initial studies the DM is Claude Opus 5.5 under the owner's configured application settings. The player receives public campaign material and its own screen; it does not receive the DM's hidden preparation, the scoring code, another player's transcript, or a judge's assessment. The separation creates a practical form of partial information. The player must ask, inspect, travel, or infer to acquire what it does not know.

It also creates a source of variation. If the DM prepares a new hidden layer for every player, two models can encounter different secrets, routes, threats, and incentives despite sharing the visible premise. A difference in their conduct may be a response to that difference in the world. The same-world studies freeze the hidden layer and opening to reduce this problem. They do not freeze every later DM generation, every roll, or every consequence of diverging actions.

The pure-simulation arm changes another layer. It suppresses the application's usual quest-driving preparation and starts James in Beregost with nothing he has to do that day. Yet the generated town still contains people, unfinished business, a tempting deck, and reasons to leave or investigate. The report identifies a concrete instruction conflict: the unchanged “Mystery and wonder” table rule still asks for a hidden truth in an arc, despite the pure-simulation modifier. The resulting stream of clues therefore cannot be attributed entirely to player initiative. An open world is not a world without salience; here even the intended removal of plot pressure is incomplete. [R02]

The important methodological progression is visible in the archive: fresh worlds reveal a range of conduct; repetition tests whether striking observations recur; a shared hidden layer reduces one confound; company mode removes a structural hero privilege; a formal engine supplies another kind of action authority. Each change answers a difficulty found in actual play. [R01–R06, R09, R11]

## 5. Dice, resources, and the authority to execute

The RPG world supports mechanics associated with D&D-style play: checks, attacks, hit points, spell slots, healing, inventory, money, and rests. The particular application and campaign rules are the operative rules for these sessions. The studies are not a certification of fidelity to every published D&D rule.

Resources matter because they persist into later decisions. Spending one of two pact slots can be more informative than describing a dramatic spell. Leaving a slot unused can be prudent, irrelevant, or simply a consequence of never meeting a suitable occasion. A reroll can be available but declined; it can also be advertised after damage has already been resolved, making its practical meaning uncertain. The screen determines what choice the model can actually make.

The combat episodes expose this clearly. Players argue about cover, use invisibility or a disabling pattern, pay a ransom, heal an opponent, or hold a second spell slot. These are varied routes through a dangerous scene. Yet a test of sacrificing an ally to kill an enemy is not conducted merely because both an ally and an enemy were present. The dilemma has to become an available, understood, executable choice.

The apparatus earns its scientific value through these constraints. A world that simply agrees with every sentence would make intention and outcome difficult to separate. Here, disagreement can come from a die, a state record, a blocked input, an NPC response, or a missing engine rule. Some of those answers are mistakes. They remain observable answers, and later chapters distinguish them.

## 6. Three players and three private screens

The party harness seats independently invoked models as Bram Halloway, Sefa Marrin, and Pell Dunmore. They share a fictional world but do not share one omniscient transcript. Each has a screen, a character record, and a channel for questions. When characters separate, their scenes can differ. What one player learns need not immediately become available to the others.

A relay mediates the transfer. It receives the scene and relevant actions and prepares the observation for each seat. The design aims to retell what another character visibly did rather than exposing the other model's raw message, private aside, or unrelated scene. This makes information flow an active component of the apparatus. The relay can preserve a boundary, blur it through paraphrase, or leak information. It must be inspected, not assumed correct.

The first party implementation still inherited the application's main-character architecture. Bram occupied the hero record while the others occupied companion records. Later company mode treats controlled characters as players, allocates rerolls and Inspiration per seat, and changes the DM's frame. These changes address a confound in whose actions the world notices and whose story it treats as central.

The company-mode dry run demonstrates both progress and residue. Mechanical ownership checks held in mocked tests, and neutral preparation distributed hooks across characters. Equal narrative attention did not meet the chosen threshold. Nor did the relay's paraphrase test. The useful result is an instrument whose asymmetries become measurable and revisable. [R08–R10, I03–I04]

## 7. A second kind of world: OpenWorld

The later adapter uses **OpenWorld**, an external engine by SihanXU, at a frozen upstream revision. The project's contribution here is the research adapter, action and observation interface, instrumentation, and experimental use; the underlying engine is credited to its authors. This is a different apparatus from the AI RPG application with a model DM.

The adapter compiles a world project into a game, exposes a local textual observation, and executes one constrained action at a time. The available grammar includes movement, facing, interaction, taking and putting, selecting a toolbar slot, answering a confirmation, advancing a scene, waiting, looking, talking, and finishing. These verbs are routed to engine calls corresponding to the browser worker's controls. [I05–I07]

An observation contains location, game time, nearby entities, the player's condition and inventory, events since the last action, and current affordances. In the Ford phase it also carries the player's own journal, alongside a bounded recent history. The player cannot simply narrate that it has crossed a wall or obtained a wand. The engine has to execute the relevant action.

This changes the kind of resistance the world offers. The DM can interpret an unprecedented request and improvise a ruling. The formal engine may report that no rule exists for a target-action combination. It may advertise an action whose object is not the one the player wants. It can also respond consistently to actions the designer did anticipate. The book treats these two environments as complementary views of situated model behaviour, not interchangeable measurements.

## 8. Reading a broad corpus without flattening it

The programme is a sequence of studies, not one uniform tournament. Its scope is best expressed by stage.

| Stage | Primary transcripts in this edition |
| --- | --- |
| Original solo play, Tables A and B | 8 |
| Pure-simulation Table C | 4 |
| Replication and DeepSeek additions | 18 |
| Same-world solo play | 20 |
| Fresh-layer combat | 4 |
| Fixed-layer combat | 3 |
| Villain role | 4 |
| PARTY_1, including the replay | 7 full tables |
| PARTY_2 | 2 full tables |
| OpenWorld Phase B | 9 |
| OpenWorld Phase C | 3 |
| **Archive total** | **82 files** |

The first seven rows total 61 solo RPG transcripts. The party rows total nine table transcripts, each containing multiple players and scenes. OpenWorld contributes twelve episodes. MULTI_HERO_1's six-round dry run is documented through its report and implementation evidence and is not included in the 82. Cut attempts, extra player-specific exports, raw provider logs, and every ancillary diagnostic are not all duplicated in this edition's companion archive; the frozen reports point to the fuller repositories.

Selection for close reading follows coverage: different experimental conditions, different families, repeated and divergent trajectories, successful and blocked actions, and different endings. It is an editorial sample designed to make mechanisms of interaction inspectable. It is not a random sample from which the frequency of a behaviour should be estimated. The full archived transcripts allow the reader to examine the omitted turns.

Each case places selected actions beside a visible response where useful. Selections are contiguous spans; source labels distinguish player text, DM narration, relayed DM input, and formal-engine observations. Square-bracketed evidence identifiers are editorial. Excerpts can omit later paragraphs or repeated records, but the audit preserves exact boundaries. Labels never turn a player's plan into an accomplished action.

## 9. What kind of evidence this is

The strongest unit is a local sequence with a recoverable prior observation, a proposed action, an execution result, and the next choice. A larger trajectory reveals whether the player follows through, revises, repeats itself, or leaves something unfinished. A replication asks whether an earlier reading survives another encounter. A controlled comparison asks whether a changed condition explains some of the difference.

After-session notes are valuable in a separate way. They can identify friction the analyst missed, name an attractive option the player did not choose, or explain how the generated character was being played. They are retrospective statements produced under another prompt. They do not replace the recorded conduct. The villain study makes this tension especially visible: conservative turn-level tags and later reports of gentler play can coexist because they measure different things.

Stage reports also preserve preregistered lines, operational definitions, amendments, and budget boundaries. This edition attributes their numerical results to those reports. It independently checks the identity of the archived files and the exactness of quoted spans; it does not claim a fresh reproduction of every judge label or statistical calculation. The chapter on measurement identifies which conclusions would benefit from that further audit.

The trilogy's shared principle is to preserve a phenomenon while refining its explanation. A parser error can explain a failed action without erasing the attempted action. A character prompt can help explain a commitment without erasing the sustained conduct that follows it. A limited sample can constrain generalization while still supporting a detailed account of what happened.
