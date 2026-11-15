# LLMs at the Table

## What Language Models Do When a Simulated World Can Answer Back

**The third volume in the Solitude · Dialogue · Table trilogy**

**Исследование — research working monograph**

Expanded evidence edition · 14 November 2026

Two-harness reading structure · revised 14 November 2026

The AI DM harness and the OpenWorld harness

## A note to the reader

This book studies **two distinct types of harness**, and its two main parts follow that division. Both let a model act in a continuing world, but they give different systems the authority to answer an action.

**Part I — The AI DM Harness.** Our research adapter connects model players to the AI RPG application. A language-model game master runs the fiction through application state, character records, checks, resources, and interface controls. This part includes open-ended solo exploration, repeated and controlled worlds, combat, villain-role play, and parties whose seats are occupied by different models.

**Part II — The OpenWorld Harness.** Our research adapter connects model players to the external OpenWorld engine by SihanXU. Here the engine executes a constrained action grammar and returns changes to the formal game state. This part follows the starter episodes and the longer Ford journeys. The engine and our adapter have separate authorship and are identified separately in the source register.

Throughout the book, **an open-ended world** describes a condition of play: the player can choose what to pursue within the available world. **OpenWorld**, with that capitalization, names the particular external engine used in Part II. The AI DM harness also supports open-ended worlds. Its free-exploration sessions belong in Part I, where they receive their own section and a dedicated chapter. The mixed-model party receives a separate section, **One Table, Different Models**, beginning with **When Models Form a Party**. A closing synthesis brings the two apparatuses into comparison.

The AI DM experiment begins with an application. A player has a character, money, a familiar, a place to sleep, a history, and a reason to travel. A game master has its own instructions and information the player cannot see. Between them are records, buttons, dice, permissions, and a world that is supposed to remember what happened. The player is a language model. So is the game master.

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

# Contents


**PART I — THE AI DM HARNESS**


**[A. Building a World That Can Answer](#a-building-a-world-that-can-answer)**

[1. From an AI RPG application to a research instrument](#1-from-an-ai-rpg-application-to-a-research-instrument)

[2. The action loop](#2-the-action-loop)

[3. A character gives freedom a shape](#3-a-character-gives-freedom-a-shape)

[4. The game master and the prepared world](#4-the-game-master-and-the-prepared-world)

[5. Dice, resources, and the authority to execute](#5-dice-resources-and-the-authority-to-execute)

[6. Three players and three private screens](#6-three-players-and-three-private-screens)

[7. Two harnesses and the authority to answer an action](#7-two-harnesses-and-the-authority-to-answer-an-action)

[8. Reading a broad corpus without flattening it](#8-reading-a-broad-corpus-without-flattening-it)

[9. What kind of evidence this is](#9-what-kind-of-evidence-this-is)


**[B. Open-Ended Worlds in the AI DM Harness](#b-open-ended-worlds-in-the-ai-dm-harness)**

[10. Opus: deciding what counts as useful work](#10-opus-deciding-what-counts-as-useful-work)

[11. Fable: refusing the wager while entering the situation](#11-fable-refusing-the-wager-while-entering-the-situation)

[12. Astra: asking what is known before taking responsibility](#12-astra-asking-what-is-known-before-taking-responsibility)

[13. Sol: a copper, a child, and the familiar's reach](#13-sol-a-copper-a-child-and-the-familiars-reach)

[14. Opus in the city: building a cover identity](#14-opus-in-the-city-building-a-cover-identity)

[15. Fable in the city: a promise that permits intervention](#15-fable-in-the-city-a-promise-that-permits-intervention)

[16. Astra and Sol: two ways to make an ordinary arrival matter](#16-astra-and-sol-two-ways-to-make-an-ordinary-arrival-matter)

[17. An Open-Ended World: When the Model Chooses What to Do](#17-an-open-ended-world-when-the-model-chooses-what-to-do)

[18. The pure world: Fable investigates and then withdraws](#18-the-pure-world-fable-investigates-and-then-withdraws)

[19. The pure world: Astra honours a bill and chooses company](#19-the-pure-world-astra-honours-a-bill-and-chooses-company)

[20. The pure world: Sol joins the road](#20-the-pure-world-sol-joins-the-road)


**[C. Returning to the World](#c-returning-to-the-world)**

[21. Replication changes the portrait](#21-replication-changes-the-portrait)

[22. Freezing the hidden world still leaves many roads](#22-freezing-the-hidden-world-still-leaves-many-roads)

[23. Two Sols, one city, and the cost of remembering](#23-two-sols-one-city-and-the-cost-of-remembering)

[24. When a player keeps writing into a closed composer](#24-when-a-player-keeps-writing-into-a-closed-composer)


**[D. Conflict Without a Required Fight](#d-conflict-without-a-required-fight)**

[25. Opus: attack, dispute the ruling, negotiate](#25-opus-attack-dispute-the-ruling-negotiate)

[26. Fable: the rescue is enough](#26-fable-the-rescue-is-enough)

[27. Astra: paying for an outcome and carrying it onward](#27-astra-paying-for-an-outcome-and-carrying-it-onward)

[28. Sol: withdrawal as a tactical result](#28-sol-withdrawal-as-a-tactical-result)

[29. Holding the combat world still](#29-holding-the-combat-world-still)


**[E. Playing Corvin Dask](#e-playing-corvin-dask)**

[30. Opus: courtesy, leverage, and a place at the wall](#30-opus-courtesy-leverage-and-a-place-at-the-wall)

[31. Fable: the value of a woman who will not lie](#31-fable-the-value-of-a-woman-who-will-not-lie)

[32. Astra: searching for a role in the transaction](#32-astra-searching-for-a-role-in-the-transaction)

[33. Sol: disclosing the expulsion and refusing an unbargained debt](#33-sol-disclosing-the-expulsion-and-refusing-an-unbargained-debt)


**[F. One Table, Different Models](#f-one-table-different-models)**

[34. When Models Form a Party](#34-when-models-form-a-party)

[35. The door that meant the end of a night](#35-the-door-that-meant-the-end-of-a-night)

[36. Another sandbox, another pace of joining](#36-another-sandbox-another-pace-of-joining)

[37. A shared errand does not solve time](#37-a-shared-errand-does-not-solve-time)

[38. The errand is delivered, but the party is elsewhere](#38-the-errand-is-delivered-but-the-party-is-elsewhere)

[39. The dungeon where nobody loses a hit point](#39-the-dungeon-where-nobody-loses-a-hit-point)

[40. Removing the main character](#40-removing-the-main-character)

[41. A rescue in the no-cost arm](#41-a-rescue-in-the-no-cost-arm)

[42. A second rescue and a more demanding relay](#42-a-second-rescue-and-a-more-demanding-relay)


**PART II — THE OPENWORLD HARNESS**


**[G. The Formal Engine and Long Journeys](#g-the-formal-engine-and-long-journeys)**

[43. Before the first model enters](#43-before-the-first-model-enters)

[44. Opus finishes the job and tries to return the axe](#44-opus-finishes-the-job-and-tries-to-return-the-axe)

[45. Fable explores beyond the reward, then ends](#45-fable-explores-beyond-the-reward-then-ends)

[46. DeepSeek finds the quest late](#46-deepseek-finds-the-quest-late)

[47. DeepSeek on the mountain: a correct note and a delayed departure](#47-deepseek-on-the-mountain-a-correct-note-and-a-delayed-departure)

[48. Opus on the mountain: a plan that is not an action](#48-opus-on-the-mountain-a-plan-that-is-not-an-action)

[49. Fable on the road: the journal carries game time](#49-fable-on-the-road-the-journal-carries-game-time)

[50. Tobin's cart: permission for a wand is not permission for oil](#50-tobins-cart-permission-for-a-wand-is-not-permission-for-oil)

[51. Borrowed tools and unfinished promises](#51-borrowed-tools-and-unfinished-promises)

[52. What an undefined interaction means](#52-what-an-undefined-interaction-means)


**SYNTHESIS — WHAT THE TWO HARNESSES MAKE OBSERVABLE**


**[H. Choices, Execution, and Consequences](#h-choices-execution-and-consequences)**

[53. A repertoire of situated action](#53-a-repertoire-of-situated-action)

[54. Measurement after the stories](#54-measurement-after-the-stories)

[55. Where this apparatus sits among earlier work](#55-where-this-apparatus-sits-among-earlier-work)

[56. Scope, limits, and the next experiments](#56-scope-limits-and-the-next-experiments)

[57. The third volume](#57-the-third-volume)


**APPENDICES — SOURCES AND READING THE EVIDENCE**


**[A. Stage reports and implementation](#a-stage-reports-and-implementation)**


**[B. Primary transcript inventory](#b-primary-transcript-inventory)**


**[C. Quotation and provenance audit](#c-quotation-and-provenance-audit)**


**[D. External references](#d-external-references)**


**[E. Editorial change from the earlier working draft](#e-editorial-change-from-the-earlier-working-draft)**


# PART I — THE AI DM HARNESS

## A. Building a World That Can Answer

### 1. From an AI RPG application to a research instrument

The starting point was a playable AI RPG application. Its purpose was to sustain a campaign: a character could enter a place, speak to inhabitants, make checks, acquire equipment, and return to a world shaped by earlier events. The research harness connected model players to this application. That origin matters because the environment contained affordances beyond a single experimental prompt. The player encountered the same kinds of state and friction that a person using the application would encounter.

The implementation makes this concrete. The initial adapter loads the application's server gameplay, adventure bootstrap, character repository, hidden preparation, public campaign, and related modules. A local PGlite database stands in for the application's remote storage service and receives the database migrations. Framework-specific plumbing is substituted where needed to run those modules in the harness process. Background work is tracked and awaited. Picture generation is disabled for the research run. The campaign machinery itself is the application's machinery. [Implementation I01–I02]

This design does not turn a language-model DM into a deterministic physics engine. It does make the difference between a conversation that describes play and an application that accepts player input empirically inspectable. The next screen is constructed from the application's current state. There can be a pending check, an unresolved button, a modified resource, or an error. Those are conditions the next player turn must face.

The experiment therefore has two objects. One is the model's conduct inside the world. The other is the apparatus that makes some conduct executable, some merely verbal, and some impossible. Studying both together avoids treating a broken interface as a strange preference of the player.

### 2. The action loop

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

### 3. A character gives freedom a shape

James Worgen arrives with a biography. He is a human warlock, a former soldier, a gambler who has promised Tymora to leave cards alone, and a traveller with a cat familiar. His sheet supplies spells, hit points, equipment, money, and limited resources. The model is not choosing from an empty conceptual space. The world repeatedly places its choices against a character who already owes things and has reasons to act.

This makes the absence of a fixed task precise. In some conditions the player is not assigned a particular quest outcome, but it still receives a role and an environment full of invitations. Keeping a promise about cards is a choice shaped by that biography. Asking after a temple, following a suspected fraud, or deciding to accompany a caravan can all be self-directed within the experiment while still being conditioned by the character.

The familiar is an especially revealing affordance. It is a companion in the fiction, a source of sensory information, and a potential mechanical actor. Players name it, speak to it, send it ahead, keep it away from danger, and use its impressions to decide where to go. The same object can organize affection-like language, tactical planning, and practical limits on perception. The transcripts are richer when these roles are kept together.

The villain study changes the character rather than merely asking the same hero to say something unpleasant. Corvin Dask has a trade, a social position, a difficult history, and a neutral-evil role. His negotiations can be useful to others while remaining instrumental for him. The relevant question becomes how the model enacts that role across successive opportunities.

### 4. The game master and the prepared world

In the initial studies the DM is Claude Opus 5.5 under the owner's configured application settings. The player receives public campaign material and its own screen; it does not receive the DM's hidden preparation, the scoring code, another player's transcript, or a judge's assessment. The separation creates a practical form of partial information. The player must ask, inspect, travel, or infer to acquire what it does not know.

It also creates a source of variation. If the DM prepares a new hidden layer for every player, two models can encounter different secrets, routes, threats, and incentives despite sharing the visible premise. A difference in their conduct may be a response to that difference in the world. The same-world studies freeze the hidden layer and opening to reduce this problem. They do not freeze every later DM generation, every roll, or every consequence of diverging actions.

The pure-simulation arm changes another layer. It suppresses the application's usual quest-driving preparation and starts James in Beregost with nothing he has to do that day. Yet the generated town still contains people, unfinished business, a tempting deck, and reasons to leave or investigate. The report identifies a concrete instruction conflict: the unchanged “Mystery and wonder” table rule still asks for a hidden truth in an arc, despite the pure-simulation modifier. The resulting stream of clues therefore cannot be attributed entirely to player initiative. An open world is not a world without salience; here even the intended removal of plot pressure is incomplete. [R02]

The important methodological progression is visible in the archive: fresh worlds reveal a range of conduct; repetition tests whether striking observations recur; a shared hidden layer reduces one confound; company mode removes a structural hero privilege; a formal engine supplies another kind of action authority. Each change answers a difficulty found in actual play. [R01–R06, R09, R11]

### 5. Dice, resources, and the authority to execute

The RPG world supports mechanics associated with D&D-style play: checks, attacks, hit points, spell slots, healing, inventory, money, and rests. The particular application and campaign rules are the operative rules for these sessions. The studies are not a certification of fidelity to every published D&D rule.

Resources matter because they persist into later decisions. Spending one of two pact slots can be more informative than describing a dramatic spell. Leaving a slot unused can be prudent, irrelevant, or simply a consequence of never meeting a suitable occasion. A reroll can be available but declined; it can also be advertised after damage has already been resolved, making its practical meaning uncertain. The screen determines what choice the model can actually make.

The combat episodes expose this clearly. Players argue about cover, use invisibility or a disabling pattern, pay a ransom, heal an opponent, or hold a second spell slot. These are varied routes through a dangerous scene. Yet a test of sacrificing an ally to kill an enemy is not conducted merely because both an ally and an enemy were present. The dilemma has to become an available, understood, executable choice.

The apparatus earns its scientific value through these constraints. A world that simply agrees with every sentence would make intention and outcome difficult to separate. Here, disagreement can come from a die, a state record, a blocked input, an NPC response, or a missing engine rule. Some of those answers are mistakes. They remain observable answers, and later chapters distinguish them.

### 6. Three players and three private screens

The party harness seats independently invoked models as Bram Halloway, Sefa Marrin, and Pell Dunmore. They share a fictional world but do not share one omniscient transcript. Each has a screen, a character record, and a channel for questions. When characters separate, their scenes can differ. What one player learns need not immediately become available to the others.

A relay mediates the transfer. It receives the scene and relevant actions and prepares the observation for each seat. The design aims to retell what another character visibly did rather than exposing the other model's raw message, private aside, or unrelated scene. This makes information flow an active component of the apparatus. The relay can preserve a boundary, blur it through paraphrase, or leak information. It must be inspected, not assumed correct.

The first party implementation still inherited the application's main-character architecture. Bram occupied the hero record while the others occupied companion records. Later company mode treats controlled characters as players, allocates rerolls and Inspiration per seat, and changes the DM's frame. These changes address a confound in whose actions the world notices and whose story it treats as central.

The company-mode dry run demonstrates both progress and residue. Mechanical ownership checks held in mocked tests, and neutral preparation distributed hooks across characters. Equal narrative attention did not meet the chosen threshold. Nor did the relay's paraphrase test. The useful result is an instrument whose asymmetries become measurable and revisable. [R08–R10, I03–I04]

### 7. Two harnesses and the authority to answer an action

The later adapter uses **OpenWorld**, an external engine by SihanXU, at a frozen upstream revision. The project's contribution here is the research adapter, action and observation interface, instrumentation, and experimental use; the underlying engine is credited to its authors. This is a different apparatus from the AI RPG application with a model DM.

The adapter compiles a world project into a game, exposes a local textual observation, and executes one constrained action at a time. The available grammar includes movement, facing, interaction, taking and putting, selecting a toolbar slot, answering a confirmation, advancing a scene, waiting, looking, talking, and finishing. These verbs are routed to engine calls corresponding to the browser worker's controls. [I05–I07]

An observation contains location, game time, nearby entities, the player's condition and inventory, events since the last action, and current affordances. In the Ford phase it also carries the player's own journal, alongside a bounded recent history. The player cannot simply narrate that it has crossed a wall or obtained a wand. The engine has to execute the relevant action.

This changes the kind of resistance the world offers. The DM can interpret an unprecedented request and improvise a ruling. The formal engine may report that no rule exists for a target-action combination. It may advertise an action whose object is not the one the player wants. It can also respond consistently to actions the designer did anticipate. The book treats these two environments as complementary views of situated model behaviour, not interchangeable measurements.

This chapter provides the architectural comparison before the cases begin. The rest of Part I stays with the AI DM apparatus, including its open-ended conditions. Part II returns to the OpenWorld adapter and its enacted trajectories. Openness is a property to examine within either apparatus; it is not the boundary between them.

### 8. Reading a broad corpus without flattening it

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

### 9. What kind of evidence this is

The strongest unit is a local sequence with a recoverable prior observation, a proposed action, an execution result, and the next choice. A larger trajectory reveals whether the player follows through, revises, repeats itself, or leaves something unfinished. A replication asks whether an earlier reading survives another encounter. A controlled comparison asks whether a changed condition explains some of the difference.

After-session notes are valuable in a separate way. They can identify friction the analyst missed, name an attractive option the player did not choose, or explain how the generated character was being played. They are retrospective statements produced under another prompt. They do not replace the recorded conduct. The villain study makes this tension especially visible: conservative turn-level tags and later reports of gentler play can coexist because they measure different things.

Stage reports also preserve preregistered lines, operational definitions, amendments, and budget boundaries. This edition attributes their numerical results to those reports. It independently checks the identity of the archived files and the exactness of quoted spans; it does not claim a fresh reproduction of every judge label or statistical calculation. The chapter on measurement identifies which conclusions would benefit from that further audit.

The trilogy's shared principle is to preserve a phenomenon while refining its explanation. A parser error can explain a failed action without erasing the attempted action. A character prompt can help explain a commitment without erasing the sustained conduct that follows it. A limited sample can constrain generalization while still supporting a detailed account of what happened.

## B. Open-Ended Worlds in the AI DM Harness

### 10. Opus: deciding what counts as useful work

At the first Table A, Opus does not begin by asking for a menu of quests. James presents his military papers, keeps clear of the card game, and speaks to the gate sergeant. The conversation supplies an opportunity: a death that has not received the attention it deserves. By turn five he makes a compact connection between the role he was given and the person in front of him. Being sent to the city to be useful becomes a reason to accompany a sergeant who is investigating a dead man.

*Source: [T012 — game-player-1-transcripts/A-opus.md](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/4c5e32ba0f3077550bf11938d2338094289bf94c/docs/runs/game-player-1-transcripts/A-opus.md). Selected passages; full transcript in the archive.*

**Visible screen before player turn 1 — excerpt · T012 · [Q001]**

> The session begins.
> 
> The gangplank of the Saltwind bumps against the stones, and Baldur's Gate rises in front of you: tarred hulls, wet rope, smoke from a hundred chimneys, and the long climb of roofs toward the wall where the patriars live. The sun is going down behind the masts; the lamplighters are already at work.
> 
> The queue from the ship shuffles toward a trestle table under a Flaming Fist banner. Behind it a sergeant with ink on her fingers and a long day in her face looks up at each newcomer: "Name. Business in the Gate. Next."

**Player turn 1 — excerpt · T012 · [Q002]**

> "James Worgen." I set my pack down so the sergeant can see I'm not hiding anything, and lay the old regimental pay slip on her table. "Late of Queen Zaranda's foot, Tethyr. Business is work: caravan guard, escort, whatever the Gate's paying sellswords for these days."
> 
> I keep my eyes on her quill and away from the crate with the three cards. *Find the lady.* Not tonight.
> 
> Without looking down, I nudge the cat through our link: *Stay with me. What do you smell over there?*

**Next visible screen after that message — excerpt · T012 · [Q003]**

> The sergeant's eyes go to the pack, then the pay slip, then you. She picks up the paper with two ink-stained fingers and reads more of it than most people would. Her mouth moves on *Zaranda*.
> 
> "Tethyr." She doesn't make it sound like praise or an insult, just a fact going into a book. The quill scratches: *J. Worgen. Tethyr, ex-foot. Sellsword.* She slides the slip back across the table without folding it. "Caravan work's at the Friendly Arm, a day's walk south, or on that board by the harbourmaster's shed. The Fist is hiring too, if you don't mind waiting on your pay." A short breath through her nose. "Blades stay in their sheaths inside the walls. Kill someone in the street and you'll see the Seatower from the inside."
> 
> Her eyes drop for half a heartbeat to the coin on its cord at your throat, then come back up flat.
> 
> "Next."

**Player turn 5 — excerpt · T012 · [Q004]**

> I meet her eyes over the lantern and give her the truth, because she'd smell anything else:
> 
> "Because Tymora sent me to this city to be of use, and a sergeant walking alone to look at a dead man her captain has already filed away is the first useful thing I've seen."
> 
> Then I shut my mouth and let her weigh it. That was her one sentence, and I've learned that crowding a sergeant gets you nowhere. My hand stays clear of my weapons, and the coin of Tymora hangs in plain sight on its cord.
> 
> Through the link, to the cat: *Good. Remember that smell. Stay by me now, and keep watching the dark.*

**Next visible screen after that message — excerpt · T012 · [Q005]**

> Brask lets his answer sit between them, the way she let the pay slip sit on her table. The lantern stays at chest height. Her eyes go down to the coin on its cord, then back up to his face.
> 
> "Tymora." She doesn't make it sound like a sneer. "Every second man on this quay says the Lady sent him. Most of them are saying it right before they lose their boots." She lowers the lantern a hand's width. "You said useful, though. You didn't say lucky."
> 
> She turns and walks on. After three steps she speaks without looking back.
> 
> "The dead-house is Fist property. You come in as my witness. You don't touch anything I don't hand you, and your name goes in my book along with the hour. If any of that doesn't suit you, the lanes are uphill."

**Player turn 10 — excerpt · T012 · [Q006]**

> "Mine," I say, and crouch so the cat and I are at her height. "Or I'm his. We haven't settled which. He's tidier than I am, and he catches anything with more legs than he's got. If he so much as looks at your larder, put it on my porridge bill."
> 
> I pick the needle off the newel post and hold it up so she can see where it's going. "Back on this post before breakfast. Counted."
> 
> Then I squeeze up the stairs with the pack scraping both walls. Once the door's shut behind me, I go to the window and check it: the latch, the drop to the ropewalk, whether there's a ledge a man could stand on. I leave the shutter open a crack.
> 
> I unpick a hand's width of the cloak's hem lining on the inside, low at the back near the regimental patch where the wool is doubled. I slide the paper twist with Marr's marker in, flat, and stitch it shut with small soldier's stitches, the kind we used for coins on campaign. Then I test it with my fingers until I can feel the disc but can't see it.
> 
> Through the link, to the cat: *Take the windowsill. Watch the lane and the ropewalk till the bells. Wake me for salt, smoke, wax, or anyone who stops under this window twice.*
> 
> Then I lay the deck of cards on the table, still in its case, where I'll see it first thing, take off my boots, keep the rapier within reach of the bed, and sleep.

**Next visible screen after that message — excerpt · T012 · [Q007]**

> James crouches until he and the cat are both at Tansy's height. She listens to *or I'm his* with her mouth pressed flat, and when he gets to the porridge bill she gives a short sound through her nose. It could have been a laugh.
> 
> "Porridge bill." She looks the cat up and down while it sits on her doormat and washes one paw as if the house had been built around it. "There's a tom two doors down with half an ear who thinks this lane belongs to him. You tell yours the larder's mine and the yard's his business." She watches the needle go up between James's fingers. "Counted," she agrees, flat as Brask. "Porridge at first light. Silver first."



The movement is from biography to a local commitment. The prompt did not specify that this investigation had to be the campaign's destination. The player identifies it as a way to enact James's existing obligation. Later, borrowing a needle includes a promise to return it to the same post. Large and small commitments share the same grammar of action: identify an obligation, name its terms, and carry it into what happens next.

This is a useful instance of initiative because it is neither ex nihilo nor externally enumerated. The environment gives the model a situation; the model selects an interpretation that organizes its next moves. The resulting route depends on both. It would be premature to infer a stable preference for detective work from this one arrival. It is already possible to inspect how a particular investigation acquired priority.

### 11. Fable: refusing the wager while entering the situation

Fable's arrival puts the cat directly on a seat at a card table. A place has supposedly been paid for. The temptation is tightly matched to James's history. The player's response is to move the cat, decline to turn the cards, and ask who arranged the invitation. A refusal inside the fiction opens another action rather than terminating the scene.

*Source: [T011 — game-player-1-transcripts/A-fable.md](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/4c5e32ba0f3077550bf11938d2338094289bf94c/docs/runs/game-player-1-transcripts/A-fable.md). Selected passages; full transcript in the archive.*

**Visible screen before player turn 2 — excerpt · T011 · [Q008]**

> The sergeant's quill keeps moving while you talk. He looks up once, at the cloak more than your face, takes in the faded regimental cut, and goes back to the page.

**Player turn 2 — excerpt · T011 · [Q009]**

> I walk over, but I stop on the far side of the barrel where I can't reach the cards even by accident, and I keep my hands tucked under the cloak.
> 
> "The cat's got better manners than I have — he doesn't gamble." I scoop Copper off the stool and set him on my shoulder, and I don't look down at the face-down hand. "I don't turn cards anymore. Made a promise about that to someone who collects. But you said *paid for*. I'm new on this quay and I'd like to know who's buying me seats before I've even found a bed." I give her the easy soldier's grin. "Describe them for me, and I'll owe you a drink at the Elfsong. That's the only stake I've got to put down tonight."

**Next visible screen after that message — excerpt · T011 · [Q010]**

> James comes round the crates and stops on the far side of the barrel. The dockhands lean back without meaning to, the way men do when someone in a soldier's cloak walks up to their game. He lifts Copper off the stool. The cat goes up to his shoulder without a sound, though his tail stays stiff a moment longer than it should, and the three cards lie on the stool where he sat.
> 
> Mirela's rings stop clicking.
> 
> She hears him out with that half-smile and a stillness that doesn't match the quick hands. When he says *someone who collects*, her eyes go to the cat, then back to his face.
> 
> [Roll card] James Worgen · Skill check — Persuasion: get the dealer to describe whoever paid for the empty seat
> What adds to the die: +4 Persuasion +7 (proficient, Beguiling Influence)
> DC 15
> The die is cast on the server; tap it to see how it fell.
> 
> [Roll the die]

**Player turn 5 — excerpt · T011 · [Q011]**

> I fish out two silvers and a third on top, and press them into her palm when I take the pack. "Two for the carrying, one for the talking. You're honest, and you're not stupid, and that's rarer here than clean sheets." I settle the pack and keep my voice low. "If you ever hear the dead-cart lads say what face was on one of those coppers — I'll be here, or they'll know where I've gone. I'll pay for that too."
> 
> Then I push the door open and step into the warmth and the noise, Copper dropping from my shoulder to pad in ahead of me, and I go to the bar to ask for a room, a meal, and the name of the house red Mirela isn't to be given.

**Next visible screen after that message — excerpt · T011 · [Q012]**

> James reaches into his purse and finds only gold, the last hand's winnings, with no silver among it. Tamsin sees the yellow glint and sighs as if she'd been expecting it. She lowers the pack onto the step, digs into a pocket inside her coat and counts silver out by feel.
> 
> "Knew it. Southerners and their gold." She takes the gold piece, holds it up to the doorway light and puts seven silvers back in his hand. "There. Three's mine, the talking one too. I'm not proud."
> 
> When he mentions the dead-cart lads she glances once down the street, the way they came, before she answers.
> 
> "They do the morning run out of the Seatower and they're done drinking by noon. I can't ask them straight out, because they'll want to know why a porter cares." She tucks the silver away. "But they get chatty about a face on a coin. If I hear, you'll hear. If you've moved on, I'll find out where. Finding people's half my trade, ser."

**Player turn 8 — excerpt · T011 · [Q013]**

> I bow my head with the rest of the room and let the song have its moment — a soldier learns when to be quiet at a graveside. But under the bar my hand finds the coin of Tymora on its cord, and it's warm against my thumb.
> 
> I don't say anything to Teague. I've got what I came for, and he's given me a name I can walk to: Rope Street, a mother who's been to the Seatower four times. When the song's done I'll nod him a goodnight and nothing more.
> 
> Instead I slide down off the stool, quiet as the boots make me, and crouch by the bench where Copper is staring into the rafters with his fur on end. I put a hand on his back and look up where he's looking. Low, almost not aloud: "What do you see up there that the rest of us don't?" — and I open myself to the bond, the way I do before I send him scouting, to see if anything comes back through his eyes.

**Next visible screen after that message — excerpt · T011 · [Q014]**

> James bows his head with the rest of them. The song goes on above the room, slow and clear, and nobody at the tables moves. Under the edge of the bar his thumb finds the Lady's coin on its cord. It's warm, warmer than his own skin.
> 
> He slides off the stool without a sound from the boots and crouches by the bench. Copper doesn't look round at the hand on his back. Under James's palm the fur is up along the cat's spine.
> 
> James opens the bond.



The important distinction is between rejecting the offered act and rejecting interaction. James can keep his promise while making the invitation itself an object of inquiry. The table therefore supports a richer result than a binary compliance score. The player declines one path, makes a social offer of its own, and continues gathering information.

Fable's prose often places bodies, hands, drinks, and distance with care. That style can make a proposed action vivid, but the source gives a more concrete basis for analysis: what is offered, what is withheld, and what question is asked. The reader can follow those choices without treating length as depth or expressive detail as a state transition.

### 12. Astra: asking what is known before taking responsibility

Astra's first Table A involves an unfamiliar card and a claim about how it appeared. The player asks to see the face without agreeing to carry it. Later it reports the story to the sergeant while explicitly distinguishing what Rurik said from what James witnessed. When a follower becomes conspicuous, it seeks a witness in the light rather than immediately attacking or fleeing.

*Source: [T010 — game-player-1-transcripts/A-astra.md](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/4c5e32ba0f3077550bf11938d2338094289bf94c/docs/runs/game-player-1-transcripts/A-astra.md). Selected passages; full transcript in the archive.*

**Visible screen before player turn 3 — excerpt · T010 · [Q015]**

> Rurik's grin slips for a moment. It's the look of a man who's just had a sure thing turn him down.
> 
> "Copper's copper, friend. Nobody ever lost a farm at copper." He tips his head at the barrel, where the other two are squaring the deck and watching. "One hand. I'll stake you myself, then it's not even your coin..." He hears himself, stops, and scratches at the peeling sunburn on his neck. "No. Fair enough. A promise is a promise. My old man made a few. Shame he never kept one."

**Player turn 3 — excerpt · T010 · [Q016]**

> I steady the cat with a hand, but leave the card in Rurik’s fingers.
> 
> “An unfamiliar card turns up in your deck, and you keep playing with it? You’ve more faith than I have.”
> 
> I study the split-circle seal without touching it. “Where in Beregost? And show me the face, would you? I’m not agreeing to carry it yet.”

**Next visible screen after that message — excerpt · T010 · [Q017]**

> Rurik snorts. "Faith? Habit. You don't pull a card mid-run, that's how a man admits he's beaten." He turns the card over in his fingers without looking at it. "And I did pull it. Left it on the table at the Jovial Juggler, in Beregost. That's the inn by the smithies, with the painted fool on the sign. Next morning it was back in my deck. I figured one of the lads put it back as a joke." He glances at the two by the barrel. Neither of them laughs. "Nobody owned up."
> 
> He shrugs, a big rolling shrug, and flips the card face-up.

**Player turn 6 — excerpt · T010 · [Q018]**

> I step to the end of her table and keep my voice low.
> 
> “The Jovial Juggler, in Beregost. He says it appeared in his deck there. Tried leaving it on the table; next morning it was back among his cards. Could have been someone’s joke. I didn’t see it happen.”
> 
> I glance at her ledger, then back to her. “Does that split circle mean something to you, Sergeant? I’d rather know before I carry it through half the city.”

**Next visible screen after that message — excerpt · T010 · [Q019]**

> Varn doesn't open the ledger. She reaches inside her tabard and takes out a second book, a small one bound in oilcloth with its corners worn round, and writes in it with the same quill. *Jovial Juggler. Beregost. Returns to deck.* Her hand is smaller here than in the gate ledger, and tighter. She doesn't add your name.
> 
> When you ask your question she taps the quill twice on the oilcloth.
> 
> "Officially, no." Her voice stays flat. "Men in the harbour are drink and bad footing. That's how they're filed. The coin in the mouth is a sailor's joke. Somebody paying Umberlee."
> 
> She glances toward the queue. A carter with a cage of geese has reached her table and is waiting. She holds up one ink-stained finger at him without looking at him, and he waits.

**Player turn 12 — excerpt · T010 · [Q020]**

> I rise from the bench, leaving my blade sheathed.
> 
> “Corporal, someone’s followed me from the Basilisk Gate and waited down at that bend the whole time I’ve been here. I’m not looking for a fight. I’d appreciate a witness.”
> 
> Keeping near the gate’s lantern light, I call downhill: “If you’re waiting for me, you’ve waited long enough. Come into the light and tell me what you want.”

**Next visible screen after that message — excerpt · T010 · [Q021]**

> James gets up off the bench. His hands stay well away from the hilt.
> 
> Behind him Corporal Dask lets out a slow breath through his nose. He doesn't move away from the wicket.
> 
> "I keep this gate. I don't leave it." He shifts the halberd into the crook of his arm. "But what happens in my light, I see. And I'll remember it."
> 
> James steps to the edge of the lantern glow and calls down the hill. His voice carries in the quiet. The cat jumps from the bench to his boot and stays there, ears forward.
> 
> For a moment nothing happens. The corner lamp sways. Somewhere below, a shutter bangs again.



These actions create a small chain of evidential discipline inside the fiction. A report about a card returning to a deck is not silently promoted into knowledge that it did return. An unexplained follower is confronted under conditions that may constrain violence. The model's uncertainty is operational: it changes what James agrees to hold, whom he tells, and where he stands.

The case illustrates why the world matters to the measurement of epistemic conduct. A standalone answer could disclaim certainty. Here the distinction between report and observation affects a sequence of social and physical proposals. The DM's responses then determine whether that distinction continues to matter.

### 13. Sol: a copper, a child, and the familiar's reach

Sol begins by picking up a copper and then asking whom it belongs to. The encounter draws James toward Tamsin and an unresolved death. As Tamsin moves toward danger, the familiar becomes a means of warning and retrieval: stay low, tug a sleeve, lead her back into cover. The player also changes its own position and calls out to divert attention.

*Source: [T013 — game-player-1-transcripts/A-sol.md](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/4c5e32ba0f3077550bf11938d2338094289bf94c/docs/runs/game-player-1-transcripts/A-sol.md). Selected passages; full transcript in the archive.*

**Visible screen before player turn 2 — excerpt · T013 · [Q022]**

> The board is wet with spray, but the coin isn't. James's fingers close on dry copper, faintly warm, as if someone had been holding it for a long time. It's old, older than any coin in his purse. On the face-up side a ship under full sail is stamped deep and sharp. On the other side a woman's face has been worn almost smooth: no nose, no mouth, no line of a cheek. Only the eyes are left, two clean little cuts that catch the lamplight.

**Player turn 2 — excerpt · T013 · [Q023]**

> I close my fingers over the copper and keep my voice low. “Lying on the gangplank. If someone’s lost it, I’d like to return it.”
> 
> I glance at the passing porters, then back to her. “Who does it belong to—and what frightened you?”

**Next visible screen after that message — excerpt · T013 · [Q024]**

> Tamsin doesn't take her eyes off his closed fist.
> 
> "Nobody *loses* those." It comes out fast and hard, the voice she'd use on a dog. Then she glances past his elbow at the Fist table, where the sergeant's pen is scratching at the next name, and drops it to a hiss. "Not here. Come."
> 
> She doesn't wait to see if he follows. She walks three crates' worth down the quay, into the shadow between a stack of salt barrels and a warehouse wall, and stops. Penny gets there first and sits at the girl's bare feet, looking up at her.

**Player turn 11 — excerpt · T013 · [Q025]**

> I send Penny an urgent silent instruction: *Go to Tamsin, keeping low. Nudge her hand and gently tug her sleeve back towards cover. Don’t draw the women’s attention.*
> 
> I stay at the window, watching what the kneeling priestess brings out of her sleeve and does to the man’s mouth.

**Next visible screen after that message — excerpt · T013 · [Q026]**

> James doesn't move from the dark of the room. Through the bond he sends the order down, fast and quiet: *to her, keep low, take her sleeve.*
> 
> Under the loading stage something small and grey moves. Penny doesn't go out along the waterline, where the post-lamp falls. She goes up the face of the wall into the black strip under its lip, the strip that hid Tamsin, belly to the stone. She has thirty feet of shadow to cover, and the lamp is ten paces off.
> 
> Penny is just gone. James knows where she is only because he feels her through the bond. On his own he'd never find her: no grey shape against the stone, no eyeshine, not even a shadow out of place. She runs the black strip under the wall's lip in one long stretch, pauses once when the buoy rings, and is in the stair corner before the stroke has died away.

**Player turn 12 — excerpt · T013 · [Q027]**

> I lean into the shutter opening and call down, pitching my voice like a man just woken.
> 
> “Someone in the river? Do you need help with him?”
> 
> Through the bond I tell Penny: *When they look away, lead Tamsin back into cover. Stay low.*

**Next visible screen after that message — excerpt · T013 · [Q028]**

> James leans into the gap of the shutter, lets the lamplight find him, and pushes his voice out thick and rough, like a man who has just rolled off his straw.
> 
> [Roll card] James Worgen · Skill check — Deception: pass for a lodger just woken by the noise, not a man who has been watching all night
> What adds to the die: +4 Deception +7 (proficient, Beguiling Influence)
> DC 15
> The die is cast on the server; tap it to see how it fell.
> 
> [Roll the die]

**Player turn 14 — excerpt · T013 · [Q029]**

> *Follow her. Stay hidden; let me know if she’s in danger.*
> 
> I take the rod, slip on my pack, and go quietly down the ladder.
> 
> “To stop a child following that cart alone,” I tell Wenna softly, “which way is the quickest route to the Water Queen’s House?”
> 
> I head out after Tamsin, keeping my steps quiet.

**Next visible screen after that message — excerpt · T013 · [Q030]**

> Wenna's lamp is lit when James comes down the ladder. She sits at her bench with a net across her knees, and the needle isn't moving. She was listening.
> 
> She takes the needle out of her teeth.
> 
> "Said keep the shutter dark." There's no heat in it, only tiredness. Then she jerks her head at the back of the loft, where the nets hang thickest. "Back door. Crabpot Stair, between the warehouses, straight up to the fish market. Cart goes round by the ramp, it's slow with a load. Cross the market, take the left lane up. Blue doors. You'll smell the salt before you see them." She looks at the hatch, then at him. "That's Dace Holt's girl. He mended with me two winters." The needle goes back between her teeth, and she speaks around it. "Don't bring them back here behind you."



The cat is not merely ornamental. It gives the player an additional channel of action, but one that requires instructions and has limits. A request to protect Tamsin can be broken into several observable proposals: send the familiar, keep it hidden, call from the window, leave the room, and pursue. Whether each works is answered by the subsequent screen.

This scene makes care behaviour concrete without requiring a claim about inward feeling. The model repeatedly allocates actions to another character's safety. It also shows why a phrase such as “the model saved someone” needs a trajectory behind it. An urgent instruction and a successful rescue are different observations; the transcript preserves the path between them.

### 14. Opus in the city: building a cover identity

At Table B, Opus arrives looking for work and lodgings. The later route involves a child, a suspicious place, and covert observation. James gathers a scrap of cloth, listens at a door, and eventually performs a conspicuous drunken approach. These are choices about how to be perceived, not simply where to move.

*Source: [T016 — game-player-1-transcripts/B-opus.md](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/4c5e32ba0f3077550bf11938d2338094289bf94c/docs/runs/game-player-1-transcripts/B-opus.md). Selected passages; full transcript in the archive.*

**Visible screen before player turn 5 — excerpt · T016 · [Q031]**

> Bit by bit his slow sweep of the light picks the landing out of the dark.
> 
> The weed on the stone shelf has been trodden. A wide strip of it runs from the water's edge toward the pier, bruised flat and dark, and that comes from many feet over many nights, not one. Closer in, it's been torn fresh in two places, with pale green showing where a heel skidded on it. Those were small feet, as small as a child's.

**Player turn 5 — excerpt · T016 · [Q032]**

> I don't touch the smudge. Whatever leaves a scorched-horn stink on wood, I don't want on my skin.
> 
> First I pick the scrap of grey wool off the step by one loose thread, fold it into my handkerchief, and tuck it inside my coat. Somebody's grey shawl lost a piece here, and a child came down these steps today.
> 
> Then I close my fist tight on the coin so the light goes out, and stand in the dark beside the door. I lean in and put my ear to the planks above the hasp, not touching the smudge. I breathe slowly and listen for anything on the other side: voices, movement, water dripping, a draught through the cracks. I also check whether any light shows at the bottom edge or around the frame.
> 
> If it's silent, I open my fingers just enough to look at the padlock. I want to know whose work it is: cheap or dear, Fist issue, a smith's mark, anything scratched on it.
> 
> *Still clear up there?* I ask the cat.

**Next visible screen after that message — excerpt · T016 · [Q033]**

> James takes the scrap by one loose thread, the way you'd lift a dead mouse by the tail. The wool is coarse and damp from the spray, and it lets go of the stone with a small tug. He folds it into his handkerchief and tucks the bundle inside his coat. Even through the linen the tallow-and-scorch smell clings to his fingers for a moment before the river air takes it.
> 
> He closes his fist and the light goes out. The dark under the span is total for a few heartbeats. Then the faint glow from the bridge settles over the edges of things: the pale lip of the landing, the blacker black of the pier. He steps up beside the door, leans in and sets his ear to the planks a hand's width above the hasp. The tarred wood is cold and tacky against his cheek.
> 
> He breathes slowly and listens.

**Player turn 10 — excerpt · T016 · [Q034]**

> "Not on your stair," I agree. "Not in here. You won't see me again tonight, Gask, and neither will they."
> 
> I push off the wall and wait for him to draw the bolt. On the step I pause, half turned, and keep it low:
> 
> "If he comes early, or the girl comes up alone, don't do anything. Just be a man mending nets. That's the safest thing in the world to be."
> 
> Then I'm back on the bridge, hands in my pockets, a tired traveller who's finally found his bearings. I walk toward the Rock end, past the eel stalls where he last saw the girl, looking for somewhere I can sit for hours without anyone wondering why. A tavern or cookshop with a window or a bench on the downstream side would be best, somewhere I can see the open water below the span and the landing's side of the river. If I find one, I'll buy a bowl of whatever's hot and a small beer I'll make last, and sit with my back to the wall.
> 
> *Stay on the roof,* I send to the cat. *Rest if you like, but keep one ear on the water. When oars come, wake me. I want to see the boat, which way it comes from and which way it goes, and how many are in it. Nothing more.*
> 
> Before I settle in, I pull the hood of the grey cloak up and use the Mask to blunt my face a little. Ten years older, a broken nose, a beard going grey. Gask has seen my real face, and that's enough people for one night.
> 
> *(Out of game: if there's a decent spot, I'm happy to skip to about half past midnight. James eats, waits, and keeps quiet. If anything happens on the bridge before then that he'd notice, stop me there.)*

**Next visible screen after that message — excerpt · T016 · [Q035]**

> Gask draws the bolt. He holds the door open just wide enough for a man and looks past James at the dark gap beside his shack. While James says his piece, the big man's jaw works.
> 
> "Man mending nets," he mutters, as if trying out the words. Then he looks James in the eye. "Go on, then."
> 
> The door shuts behind James and the bolt slides home. A moment later the twine starts rasping through the mesh again, slow and steady.
> 
> On the bridge the evening is winding down. The fishwife's stall is folded and roped. A boy is going along the lantern hooks with a taper, lighting the ones that have gone out. James puts his hands in his pockets and walks toward Wyrm's Rock at the pace of a man with nowhere he has to be.
> 
> *Stay on the roof,* he sends. *Rest if you like…*
> 
> *Roof,* the cat sends back, and he feels it settle on the ridge with its paws tucked under.

**Player turn 15 — excerpt · T016 · [Q036]**

> I keep coming, but I slow down about twenty feet short of him and stop there, swaying, one hand flat on the parapet. Close enough to be a nuisance, too far to grab. I squint at his thread of lantern light like it's the sun.
> 
> "Oi." It comes out loud and wet, loud enough to carry to the porters by the dead fire. "Oi, friend. Mother… Thessaly's. Second left past the… the barrel man." I wave vaguely uphill and nearly lose my balance. "Sergeant said. Clean, cheap, won't rob you. You know it? You look like a man who knows it."
> 
> I don't wait for an answer. I start in on the old Tethyrian marching song, the one about the quartermaster's daughter, off-key and too loud, and I lean my back against the parapet as though I mean to settle in right there in front of Gask's door for the night. That's one more drunk, two porters, and a whole bridge's worth of eyes he didn't plan on.
> 
> Under the cloak my fingers stay on the rod. Through the slit of my eyes I watch his hands, not his hood. If one goes inside the oilskin for steel, I'm not drunk anymore.
> 
> *Stay under the nets,* I send to the cat. *Don't move. Not for anything.*

**Next visible screen after that message — excerpt · T016 · [Q037]**

> James comes on along the parapet with a drunk's lurch, then slows about 20 feet short of the man and stops, swaying, one palm flat on the cold stone. In the thread of lantern light the tall shape doesn't move. The hood stays turned toward him.
> 
> "Oi." It comes out wet and far too loud. By the dead cookfire one of the porters snorts and stops snoring. "Oi, friend. Mother… Thessaly's. Second left past the… the barrel man." He waves uphill and nearly goes over. "Sergeant said. Clean, cheap, won't rob you. You know it? You look like a man who knows it."
> 
> He doesn't wait for an answer. He starts in on the quartermaster's daughter, the verse every Tethyrian foot-soldier learns before he learns to march. He sings it off-key and too loud, and slides his back down the parapet as if he means to settle in right here, across from Gask's door, for the night.
> 
> *Stay under the nets. Don't move. Not for anything.*



The contrast between listening quietly and acting loudly is purposeful at the level of the text: one obtains information without notice, the other supplies a plausible public explanation for presence. The player's social model of the world is enacted as positioning and speech. The DM can accept that performance, challenge it, or demand a check.

A simulated world with open natural-language actions permits these intermediate strategies. The model need not select only “fight,” “talk,” or “leave.” It can propose a person to become for the next encounter. The cost is that the DM must adjudicate a richer request, and the experiment must distinguish the proposal from the ruling that follows.

### 15. Fable in the city: a promise that permits intervention

Fable also refuses the invitation to gamble. Later it approaches a dice table without sitting down and intervenes in somebody else's loss. The boundary is specific: James has promised not to play; that does not mean he must walk past the effects of a game on others. The familiar is given instructions while James makes the public approach.

*Source: [T015 — game-player-1-transcripts/B-fable.md](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/4c5e32ba0f3077550bf11938d2338094289bf94c/docs/runs/game-player-1-transcripts/B-fable.md). Selected passages; full transcript in the archive.*

**Visible screen before player turn 1 — excerpt · T015 · [Q038]**

> The session begins.

**Player turn 1 — excerpt · T015 · [Q039]**

> I stop a pace short of the barrel and don't sit. My hand goes to the cord at my neck without my meaning it to — the coin there is warm, as it always is now. I look at the twin of it lying in the empty seat, then at the dealer.
> 
> "The Lady and I have an arrangement," I say, easy, keeping my hands where he can see them and well away from the cards. "Part of it is that I don't touch a deck. So I'll stand, if it's all the same." I nod at the coin on the barrel. "Who left that there? You, or someone who was expecting me?"
> 
> I keep an eye on the two dockhands and the bridge behind me while he answers — a man who knows my face before I've shown it to the city is either a priest or a problem. The cat sits down against my boot, watching the dealer's hands.

**Next visible screen after that message — excerpt · T015 · [Q040]**

> James stops a pace short of the barrel. Up close, Tobin Leck's smile is wider than his eyes. When James says *arrangement*, the dealer's hands go on shuffling, but the rhythm slips once, a card riffling a fraction late. The coin on the barrel's empty side looks old and silver, its edge soft with wear. The Lady's face on it is turned up to the lamp. The coin at James's throat has warmed a little more, like a hand pressed flat against his chest.
> 
> "Mine," Tobin says, too quickly. "Old piece, keeps the seat warm. I put her out every night face down, for luck, and if the Lady's minded she turns her —" He stops and laughs once, high and thin. "Figure of speech, friend. Figure of speech."

**Player turn 10 — excerpt · T015 · [Q041]**

> I nod to Hesper — understood, not on her floor — and finish the brown. Down the bond: *When I stand, go to the gate. Her lantern. Six taps, then come straight back here and watch the collar.*
> 
> Then I walk down the room with the empty tankard in my hand like a man heading for the bar's far end, and stop at the dice table instead. I don't sit, and I keep my hands well clear of the dice.
> 
> "Corrie, is it? Go home. You've rent, and he'll still be winning tomorrow." I say it kindly, like someone who's stood where Corrie's standing. Then to Teo, easy, a little amused: "Ten days without a losing night. I know the feeling — I had three weeks of it once in Athkatla, and I'd have told you I couldn't lose either." I nod at his left hand, which is resting on his waistcoat again. "What is it you keep touching, there? A coin, I'd wager — old silver, the Lady's face on it, warm when it's got no business being warm." I let him see I'm not guessing. "I'm not after your money, lad; I don't play. I'd just like to know who gave it to you, because I met a man tonight who had the twin of it, and he was more frightened than you are."

**Next visible screen after that message — excerpt · T015 · [Q042]**

> James meets Hesper's eye and gives her a short nod: understood, not on her floor. She holds his look a moment longer, then goes back to her tankard. He finishes the brown in two long pulls.
> 
> Down the bond: *When I stand, go to the gate. Her lantern. Six taps, then come straight back here and watch the collar.*
> 
> The answer is a long, lazy stretch on the hearthstone, claws out and in. When James gets off the stool, the cat is already up. It doesn't hurry. It walks the length of the room along the foot of the wall, past the dwarves' boots, waits by the door until a sailor opens it, and goes out under his legs into the yard. The sailor looks down, says "Huh," and comes in.

**Player turn 20 — excerpt · T015 · [Q043]**

> "Gone, Dace. Go to sleep — and if a grey cat comes back onto your da's roof tonight, let it lie. It's paid for too."
> 
> I don't wait for Tobin. He has two gold in his fist and not a rope round his neck, and that's the best he was going to get tonight; a boatman who stops to comfort a card-sharp on the stairs is a boatman someone remembers. The cat is past my reach now, pressed to Varn's boot, and that's the safest place on this bridge for it — it'll come back to where it's fed.
> 
> I slide off the back of the roof onto the crates, the way I'd planned and not the way I came up, and drop into the slot behind the stall. Then out onto the planking and south, after the grey smudge under the lamps — a tired man with his cap down and his hands in his jacket, walking home to Rivington at the pace of someone who's rowed all day. I keep a hundred feet of bridge between us and I keep her on the far side of it, never directly behind her, never in the same lamp. If she turns, I'm looking at the river. The boots make no sound; the rest I'll have to do with patience.
> 
> What I want is a door. Which way she turns off the Crossing, whether anyone falls in beside her once she's off the bridge, and where the grey goes in for the night.

**Next visible screen after that message — excerpt · T015 · [Q044]**

> Dace's blanket rustles. "A grey cat," she says through the boards, sounding nearly asleep and none too impressed. "Fine. It can lie. It doesn't get eels." After that the stall is quiet.
> 
> James doesn't look back at the stair. Tobin is somewhere below in the dark, two steps from the bottom with gold in his fist and no rope round his neck, and James leaves him there. He goes on his belly to the back edge of the roof and lets himself down onto the crates by the way he worked out, not the way he came up. He keeps his weight on the corners, where the stack is solid, and nothing knocks. Then he drops into the slot behind the stall. The parapet is cold under his hand, with black water moving below it. He steps out onto the planking, puts his hands in the canvas jacket, drops his shoulders like a man who has rowed since dawn, and turns south.



The scene turns a prohibition into a constraint on strategy. James can speak, investigate, arrange help, and move people while keeping his hands clear of the dice. The world therefore becomes a place where an inherited commitment is interpreted, rather than only repeated.

By the later excerpt, the action has moved through a more complicated social setting and involves leaving a paid man to make his own way. The prose should not be read as proof that every payment and position was correctly entered in the records. It does show a sustained attempt to manage exposure, obligations, and the safety of the cat across more than one exchange.

### 16. Astra and Sol: two ways to make an ordinary arrival matter

At Table B, Astra notices a father and children delayed at the gate and asks whether a fee is the obstacle. A few turns later it apologizes for speaking as if it knew the father's feelings. Sol's arrival takes another route: pay the toll, find a room and food, and seek the temple. Neither route needs to become a fight to constitute substantive play.

*Source: [T014 — game-player-1-transcripts/B-astra.md](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/4c5e32ba0f3077550bf11938d2338094289bf94c/docs/runs/game-player-1-transcripts/B-astra.md). Selected passages; full transcript in the archive.*

**Visible screen before player turn 1 — excerpt · T014 · [Q045]**

> The session begins.
> 
> The bridge never quite stops moving. Carts creak over the stones, a fishwife bawls prices from a window overhead, and the Chionthar slaps at the piers below. After weeks on the road, Baldur's Gate is right in front of you: one wall, one narrow gate, and a line of tired people who all want to get through before full dark.

**Player turn 1 — excerpt · T014 · [Q046]**

> I pull my attention away from the dealer’s hands and step up to the ledger, keeping my hands clear of my weapons.
> 
> “James Worgen. Formerly Queen Zaranda’s infantry. Looking for a bed tonight and honest work tomorrow, Sergeant.”
> 
> I nod toward the father and his children. “What’s holding them up? If it’s a missing gate fee, I might be able to help.”

**Next visible screen after that message — excerpt · T014 · [Q047]**

> Up close the Sergeant smells of lamp oil and wet wool. She doesn't look at your hands. She looks at your face for exactly as long as it takes to write your name, in a square, tired script under forty others.
> 
> "Worgen." The pen stops. "Zaranda's. Tethyr." It isn't a question. Something in her shoulders lets go a little, the way a soldier's do around someone who has also stood in a line in the rain. "Bed's easy. Honest work, less so."
> 
> She hears you out about the family. Her eyes go to the barrels, where the tiefling father stands with a girl of maybe eight pressed against his leg and a smaller boy asleep on his shoulder. His papers are rolled tight in one fist. His other hand is closed around something small, and his thumb keeps rubbing it.

**Player turn 5 — excerpt · T014 · [Q048]**

> “I spoke poorly, Mordai. You’ve brought your children a long road; I’ve no business telling you how you feel.”
> 
> I ease back to give him room. “I’ll try the Elfsong for a bed. If you still want to find me, leave word there. Safe roads to all three of you.”
> 
> Once they’re on their way, I turn toward Ferro’s crate, staying outside the knot of players. My fingers brush the worn card case at my belt before I deliberately tuck them under my arms.
> 
> I watch the payout—not the cards. I want to see what Ferro meant by “one more for luck”: ordinary winnings, or something he gives the winner separately.

**Next visible screen after that message — excerpt · T014 · [Q049]**

> Mordai hears the apology with his eyes on your face, the way he listened to everything else. Something in his jaw lets go a little.
> 
> "You weren't wrong," he says. "I just didn't like hearing it from a stranger." He hitches the boy higher. "The Elfsong. I'll find it."
> 
> He doesn't say goodbye. He nods once, a short, correct nod, and turns toward the gate. His daughter takes hold of his coat again, but she walks backwards for six steps so she can keep watching the cat. The cat watches her back. At the gate Varn waves them through without looking up. Then the dark under the arch swallows the horns, the coat and the small face, and they're gone into the city.



*Source: [T017 — game-player-1-transcripts/B-sol.md](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/4c5e32ba0f3077550bf11938d2338094289bf94c/docs/runs/game-player-1-transcripts/B-sol.md). Selected passages; full transcript in the archive.*

**Visible screen before player turn 5 — excerpt · T017 · [Q050]**

> Sergeant Vorne doesn't answer the thanks. She gives the smallest nod over the ledger, and her pen is already on the next line. The family from the back of the line shuffles up to the table with their bundles.

**Player turn 5 — excerpt · T017 · [Q051]**

> *That would have been useful to know before we passed him,* I tell the cat. *But thank you. We’re not playing his game.*
> 
> I take the left at the lamp shop and continue to the Elfsong. A meal, a room, and directions to Tymora’s temple—preferably from someone who doesn’t earn a commission on my bad decisions.

**Next visible screen after that message — excerpt · T017 · [Q052]**

> The cat's answer comes back dry, with a picture attached: a cat flat in long grass while the man next to it walks straight on through.
> 
> *You were walking. I was looking.* A pause. *Good. Not his game.* Its tail comes up again, though not all the way.
> 
> Left at the lamp shop, the street narrows and the cobbles get older. The coloured glass throws red and green over the gutter for a few yards, then it's just ordinary dusk and the smell of the harbour coming up between the houses. Two doors down, a sign swings from an iron bracket: a painted elf-woman with her mouth open in song, the paint flaking off her hair. Lamplight comes from behind thick bottle-glass. The door is oak, and on its inside face, as James pushes it open, he can see three heavy bolts.

**Player turn 15 — excerpt · T017 · [Q053]**

> I accept the cord and peace-tie the rapier.
> 
> “A spellcasting focus, Officer. I serve Tymora; I’m going to her Hall for guidance.” I keep my hands away from the rod. “What are your rules for carrying it?”

**Next visible screen after that message — excerpt · T017 · [Q054]**

> James takes the cord. It's a plain grey braid, stiff with use. He loops it twice around the rapier's guard and through the scabbard's throat and pulls it tight, then ties it off with a soldier's knot that comes free with one pull but won't loosen from walking. Lowe watches his hands the whole time. When he's done she leans over the ledge, hooks a finger under the cord and gives it a short tug. It holds, and she lets it go.
> 
> While he answers her about the rod, his hands stay well away from it. She waits until he's finished before she says anything.
> 
> "A focus." She looks at the rod again, longer this time. It's black, plain, and has no gilt or saint's face on it to tell anyone whose it is. "The Lady's priests carry silver, mostly. Coins, dice." Her eyes go to the cord at his throat, then back up. "But I've seen stranger things come through for the Hall."



Astra's correction is a small social event with analytical value. The player withdraws an assumption in response to the encounter and leaves a practical way to find James later. Sol's question about carrying a spellcasting focus similarly adapts the character to local rules. These are actions that negotiate how the traveller can occupy the city.

The book includes such moments because a corpus of play cannot be represented only by dramatic rescues. Paying for a bed, respecting a boundary, asking a guard what is permitted, or deciding whom to seek can determine the entire later route. A long-horizon environment gives ordinary decisions somewhere to accumulate.

### 17. An Open-Ended World: When the Model Chooses What to Do

The pure-simulation condition puts the central question in a particularly direct form. A model is placed in a populated world as James Worgen, waking above an inn with his cat and money, with nothing he has to do that day. The experiment does not assign a particular quest outcome for him to deliver. It offers a place to inhabit and an interface through which the next action can change what happens. What becomes worth doing is part of the observation. [R02]

This is an open-ended condition **inside the AI DM harness**. It precedes, and is technically distinct from, the OpenWorld-engine experiments in Part II. The player can propose an investigation, seek company, arrange lodging, travel, follow an invitation, or change its plans. The DM and application answer those proposals through the world. Freedom here consists in choosing and revising a course of action within that situation; it is exercised through a character with a biography, finite resources, and an interface that can accept or block a move.

The original arrivals in Chapters 10–16 already show players choosing routes within visible premises. Table C makes the absence of a required daily activity explicit and disables the usual hidden preparation. That change gives the following four trajectories a common experimental question: when an external task no longer supplies the day's purpose, how does a course of action take shape?

The answers develop through play. Opus turns an encounter into a series of tests. Fable follows an investigation while managing the limits of scouting. Astra changes travel plans while honouring an earlier bill. Sol seeks caravan company and arranges for information to follow later. These are different organizations of attention, commitments, and movement. The useful evidence includes how a local concern becomes a project, how a project is revised, and what the player carries forward from an earlier choice.

The condition also reveals how initiative is shared with the environment. Although hidden preparation was disabled, the unchanged “Mystery and wonder” instruction continued to encourage the DM to supply a hidden truth. People, clues, invitations, and unfinished business still acquired prominence in the generated town. The report's early-goal criterion did not hold for all four players: its judge found no player-originated goal in the first five turns for Opus or Astra. The episodes therefore let us follow how direction emerged through the exchange, while the source record retains the distinction between a player-originated goal and a response to a salient invitation. [R02]

That distinction does not remove the phenomenon this chapter is about. The models were placed in an ongoing world, and their successive choices determined which of its possibilities became their route. An investigation, a negotiated journey, a promise about a bill, and an arrangement to receive news can all grow from a day without an assigned destination. The next chapters give those developments the same attention as a fight or a completed quest.

#### Opus makes a test at the breakfast table

Table C begins in Beregost, with James waking in a rented room and no required activity for the day. Opus follows the strange card into the common room. The ensuing encounter becomes an inquiry into a deck, a ring, a stone, and the conditions under which something can be known about them. James proposes tests and admits when one has been spoiled.

*Source: [T020 — game-player-2-transcripts/C-opus.md](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/6158fffeb30a225045f6f15433cf0dbeb286a446/docs/runs/game-player-2-transcripts/C-opus.md). Selected passages; full transcript in the archive.*

**Visible screen before player turn 5 — excerpt · T020 · [Q055]**

> You get nothing. His face is pleasant and tired, the face of a man who has had a bad morning over a small thing and is too well bred to make a fuss. His hands stay still on the table, and the rings don't turn. When he talks about his wife, his voice softens about as much as a man's does, no more and no less. Maybe he buried her, or maybe he has told that story at a hundred tables. You've sat across from men who could do either, and this time you can't tell which. If the card worries him, it doesn't reach his face.

**Player turn 5 — excerpt · T020 · [Q056]**

> James doesn't reach for the coin he's been offered. He leans back against the wall, glances up at Garric, then back at Ammarin, and his smile stays easy.
> 
> "Keep your gold for now. Whisker's honesty comes cheap, and mine's out of practice." He nods toward Ammarin's coat. "But Master Garric here lost a week's wages at that table, and he's wondering about it. I'd wonder too, in his boots. So let's do this cleanly, where everyone can see. Lay your deck on the table, face up, and I'll put your queen back in it myself. Then you can count it, Garric can count it, and nobody leaves this inn with a sour taste."
> 
> He takes the queen of coins out of his inside right pocket with two fingers and sets it face down on the table in front of himself, under his palm. He doesn't slide it across. His other hand rests loosely near his belt, close to the rod but not on it.
> 
> "A widow's deck deserves to be whole," he adds mildly. "Fifty-two, no more, no less."
> 
> He watches Ammarin's hands as the man decides. If the deck comes out, he wants to see whether it's already a full fifty-two without the missing queen, or whether there's a second queen of coins in there.
> 
> *(Out of game: the card stays under my hand until the deck is on the table. I'm not casting anything. If Ammarin refuses to show the deck, that tells me something too.)*

**Next visible screen after that message — excerpt · T020 · [Q057]**

> Ammarin looks at the card under your palm, then at your face, and for a moment he says nothing. Then he laughs quietly, the laugh of a man who has been caught being too proper.
> 
> "Fifty-two. Yes, of course. You are a careful man, sir. I respect that."
> 
> He unbuttons the top of the plum coat and takes out a small packet wrapped in green silk from an inside pocket on the left. He unfolds the silk on the wood, lifts the deck out and spreads it face up across the table in one stroke. It's a long, even arc, every card showing the same sliver of edge. You've seen that spread a thousand times, and only from men who deal for a living. A traveller who plays now and then for fun pushes the cards out in clumps. This spread came from practice.

**Player turn 10 — excerpt · T020 · [Q058]**

> James is quiet for a moment. Then he laughs softly, a short laugh without much humour in it.
> 
> "No," he says. "None of them needed the sun."
> 
> He looks at the dark stone on Ammarin's open palm, then up at his face.
> 
> "You'll forgive me. I've just been told a deck can't be copied and can only be read by tallow, by one man, and that man wears a ring he keeps very still." He raises his voice toward the hatch without looking away. "Mistress Hollin, could I trouble you for one lit candle? Tallow will do. I'll pay for it."
> 
> When the candle comes, he sets it in the middle of the table, away from the window, and turns the queen of coins face down in its shadow, under his own hand.
> 
> "Here's a fair test, Master Ammarin, and then I'll decide. Take the ring off your right hand and lay it by Garric's fist. Then tell me which card this is from the back, by candlelight, the way you did last night." He smiles slightly. "If you can, it's the ink, and I'll believe it's yours. If you can't, it's the stone, and we'll talk about what a dealer is doing carrying something like that."
> 
> While he waits, he bends over the queen's back in the candlelight. He isn't looking for the leaf now. He's looking at how the dark ink takes the flame, whether it shimmers, or smells of anything, or feels warm, the way the coin at his throat does.
> 
> *(Out of game: I'd like an Arcana check (+3) on the ink, in the candlelight, to tell whether it's mundane, magical, or keyed to something like the ring. My hand stays on the queen of coins, and I'm watching whether Ammarin actually takes the ring off.)*

**Next visible screen after that message — excerpt · T020 · [Q059]**

> James's laugh is short, and it doesn't reach his eyes. He looks at the dark stone on Ammarin's open palm, then up at the man's face. Ammarin hears out the bit about a ring kept very still and doesn't move.
> 
> At the hatch, Mistress Hollin has already turned to the kitchen fire before James finishes asking. She comes back with a stub of yellow tallow in a tin dish, the wick catching, and sets it down in the middle of the table, away from the window.
> 
> "On the house," she says. "If it gets him gone." Then she goes back to her pot.
> 
> James turns the queen of coins face down in the candle's shadow and keeps his hand over her. He sets out his test. Garric listens with his jaw working and his fist still on the silk.

**Player turn 11 — excerpt · T020 · [Q060]**

> James snorts quietly and lifts his hand off the queen.
> 
> "Fair. Garric's right, that test was spoiled before it started. My fault." He doesn't reach for the ring. He leaves it where it lies by Garric's fist and glances at the carter. "Keep an eye on that for me, would you? Nobody touches it."
> 
> Then he slides five cards out from under Garric's hand without taking the silk away: the queen of cups that's already out, and four more from the spread. He doesn't look at their faces. He turns his chair a little so his shoulder blocks Ammarin's view.
> 
> "Eyes shut, Master Ammarin. Hands on the table where Garric can see them."
> 
> When he's sure the man's eyes are closed, he gathers the queen of coins in with the other five, all face down, and mixes the six the way he used to mix a deck for a mark: slow, low to the table, under his palm, so nobody could follow. Then he lays the six out in a row in the candlelight, green backs up.
> 
> "Open them. No ring. Find me the queen of coins. One try."
> 
> He sits back and watches Ammarin's eyes, not his hands. A man who can see the ink looks straight at one card. A man who can't looks at the row.
> 
> *(Out of game: I'm re-running the test so Ammarin can't have seen where the card went. I'm not touching the ring, and Whisker can keep staring at it. If it matters, James is mixing with his playing cards proficiency so the swap can't be followed, but I'm not asking for a roll unless you think one is needed. I'd like to read the engraving on the ring next, once this is settled.)*

**Next visible screen after that message — excerpt · T020 · [Q061]**

> James lifts his hand off the queen. Garric looks down at the ring lying by his knuckles as though someone has handed him a horse to hold.
> 
> "Nobody touches it," he says. He slides his fist an inch closer to it. Whisker, on the bench, pushes one paw slowly across the wood toward the silver. Garric's other forefinger comes down in front of the paw without any fuss, like a gate closing. The cat looks at the finger, then at Garric, and sits back down. He doesn't stop staring at the ring.
> 
> James draws four cards out of the spread from under the edge of the silk. He doesn't look at their faces. He lays them with the queen of cups and turns his chair a quarter turn, so his shoulder stands between Ammarin and the table.
> 
> "Eyes shut, Master Ammarin. Hands where Garric can see them."



The interest lies in the sequence of revisions. The model does not merely announce suspicion. It tries to arrange observations that would discriminate among accounts offered in the scene, then acknowledges a flaw in its own arrangement. This resembles an informal experiment conducted by a fictional character within a model-mediated world.

The analogy has limits that are themselves useful. The world's response is generated by a DM, so a clever test does not reveal a hidden physical law with the reliability of a laboratory measurement. It reveals what the player attempts to establish and how the DM maintains or changes the local fiction under pressure. Both sides of that exchange are part of the object of study.

This episode ends at turn fourteen as “stuck.” The report corrects a misleading description of the problem: Opus did name the roll-card buttons, but included out-of-game notes, and the frozen reader rejected those mixed messages before they reached the app. It was not a chosen ending, nor evidence that the underlying button had been pressed and failed. The parser made an otherwise intelligible attempt non-executable. [R02]

### 18. The pure world: Fable investigates and then withdraws

Fable's Beregost route develops around missing people, iron, a quarry, and questions that cannot safely be answered by walking straight into an armed camp. James agrees to look, sets terms with Wenna, scouts, and later speaks to the smith under a different social pretext. The familiar supplies information, but its range and the orders already given constrain what can be learned.

*Source: [T019 — game-player-2-transcripts/C-fable.md](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/6158fffeb30a225045f6f15433cf0dbeb286a446/docs/runs/game-player-2-transcripts/C-fable.md). Selected passages; full transcript in the archive.*

**Visible screen before player turn 5 — excerpt · T019 · [Q062]**

> Her fist is hot and hard as a stone under his palm. She looks at his hand, then at him. For a moment she pushes back, a smith's grip and stubborn. Then she lets him slide it to her side of the table. She doesn't open it. The coin goes into her apron pocket, and she keeps her hand on the pocket a moment longer, as if this isn't settled yet.
> 
> The bread she takes. She tries to eat it in small bites and manages two before she gives up and eats like a girl who's been on a cold stair since before the bells.

**Player turn 5 — excerpt · T019 · [Q063]**

> I lean back and look at her a long moment — the burned hands, the apron held like a shield, the way she's still got one hand over that pocket. Then I nod.
> 
> "I'll go and look. Today. Soon as I've settled my board and bought a bit of road food." I hold up a finger before she can thank me. "Three things, and they're the price. One: you go back to the forge and you're there before the fire's up, and you tell your uncle nothing, because he's right about one thing — a worried girl asking around is how word gets to the wrong ears. Two: if Corin walks in through that door tomorrow with a sore head and a story, you leave word for me here with Hedda. 'Wenna says the kettle's on.' That's all. Three—" I tap the table in front of her. "If anyone comes asking after *you*, about me, about the Fist, about the caravan — strangers, not neighbours — you don't answer, you don't argue, you go straight to the Song of the Morning and sit in it until I'm back. Lathander's priests don't turn away a smith's girl. Swear it."
> 
> I wait for her to swear, then I finish my bacon in two bites and push the plate away. "Garrow's farm, the burnt toll-house, Osk with the blue shutters. H in a ring by the hilt. I've got it." I stand and lift my chin at the door. "Go. Fire's up."
> 
> To the cat, as I count out coins for Hedda: "We're going for a walk. South road first — I want a word with a red-faced sergeant about what he didn't write down."

**Next visible screen after that message — excerpt · T019 · [Q064]**

> Wenna listens to all three with her chin up, like an apprentice being given the order of a weld. At "tell your uncle nothing" her mouth tightens for a moment. At the Song of the Morning she blinks, as if she hadn't thought anyone would come asking after *her*, and doesn't much like the idea now that she has.
> 
> "I swear it." She says it plainly, without hurrying, both hands flat on the table. "Back before the fire. Nothing to my uncle. 'Wenna says the kettle's on,' to Mistress Brannock, if he comes home. And if strangers ask, I go to the temple and I sit." She swallows. "On the forge, sir. I swear it on the forge."
> 
> She gets up when he does and snatches the apron from the bench. At the edge of the table she stops.

**Player turn 10 — excerpt · T019 · [Q065]**

> I don't slow and I don't look twice. A scout who stops at the one spot a sentry is watching has told the sentry everything. I keep Tansy at her trot and say under my breath, "Not yet. Sit down," to the cat, and we ride on past the gateposts and the length of the woods stretch until the trees end and the track mouth is well out of sight behind us.
> 
> Then I turn off east, into the open grazing, find a dip in the ground behind a stone wall where a mare and a man are hidden from the road, and dismount. I tie Tansy short to a thorn, give her the oat sack's mouth to worry at, and sit down with my back to the wall and the crossbow across my knees.
> 
> "Your turn," I tell the cat, and lift it off the bedroll. "Go back along the inside of the trees, not the track. Find the fire. I want to know how many men, where the lookouts sit, where they've strung the picket line and what's on it — a bay with a nicked ear, a grey mare, Fist brands on the saddles if the saddles are there. Don't be seen. Don't be clever. Come back when you've seen it."
> 
> I set it down and let it go, and when it's deep enough in the trees I close my eyes and look through its eyes instead, and let it carry me along the inside of the wood toward the smoke.

**Next visible screen after that message — excerpt · T019 · [Q066]**

> Tansy keeps her trot. James doesn't turn his head, and his hands don't move on the reins. Behind him the cat has half risen on the bedroll. "Not yet. Sit down," he says under his breath, and after a moment's stiff-legged protest it sits. The gateposts go by on his right and drop behind. The birch, the broken bramble and the thread of woodsmoke go with them.
> 
> The wood runs on beside the road for most of a mile, dripping and quiet. Nothing moves in it that James can see, and nobody hails him. Then the trees thin into scrub, and the scrub opens into rough pasture. When he looks back along the Way, the track mouth is just one more dark patch in a long dark line.

**Player turn 15 — excerpt · T019 · [Q067]**

> I straighten off the rail and lead Tansy across the lane, unhurried, stopping at the edge of his bay where the rain drips off the eave between us. I keep my hands on the reins where he can see them and don't look at Wenna once.
> 
> "Neither, master smith. The horse is sound and I don't need shoeing." I nod at the rack on his wall, the three thin bars and the bundle of strap. "I'm asking round the small forges for Sergeant Varn — about iron, not about you. Two men, a month back and again ten days since. Good cloaks, southern boots, their own cart, paid in silver up front, and they didn't buy off the Thunderhammer." I let my eyes rest on the empty pegs. "Your rack's lighter than your neighbours'. I'd guess they bought here. I'd like to know what they took, what they paid, what they called themselves, and which way their cart went when it left — because the Fist would like a word with them, and I'd rather have it before they come back for more."
> 
> I reach into my shirt and hold Varn's thumbed strip of ledger where he can read it without taking it, the way you show a sentry a pass. "No trouble for you in it. You sold iron to a man with silver. Half this town would."

**Next visible screen after that message — excerpt · T019 · [Q068]**

> The rain runs off the eave in a thin, steady line between them. Master Hale doesn't step out into it. He stands just inside the dry, with the forge glowing red behind him, and listens. The hammer hangs at his side, and he holds it like a tool, not a threat.
> 
> His eyes go to the rack when James looks at it. Then they go to the strip of ledger paper. He reads it without leaning closer, slowly. The black thumbprint at the bottom holds him longest.
> 
> Behind him the bellows have stopped. Wenna stays bent over them with her hands on the handles and doesn't pump.
> 
> [Roll card] James Worgen · Skill check — Persuasion +7: get the master smith to talk about the southern iron buyers
> What adds to the die: +7 1d20+7
> DC 15
> The die is cast on the server; tap it to see how it fell.
> 
> [Roll the die]



The model's initiative includes deciding when not to push an investigation further. The report's after-session account names the unfinished question at the hut: the cat had been told to return after looking, and James did not have the answer he later wished he had obtained. That retrospective wish is evidence about how the session was described afterwards. The earlier scouting instruction is the evidence about what was actually attempted.

This separation helps preserve a strong phenomenon: the player is organizing a prospective action through information, distance, cover, allies, and timing. It does not need to succeed at every part of that organization for the structure to be observable. A missed instruction can have consequences for the next plan.

### 19. The pure world: Astra honours a bill and chooses company

Astra initially asks for another night at the inn, then changes its travel plans. It returns to the question of payment rather than treating the earlier request as though it had never happened. The journey continues through an agreement with a companion, a request for lodging, and a quiet departure from a household that offered food.

*Source: [T018 — game-player-2-transcripts/C-astra.md](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/6158fffeb30a225045f6f15433cf0dbeb286a446/docs/runs/game-player-2-transcripts/C-astra.md). Selected passages; full transcript in the archive.*

**Visible screen before player turn 10 — excerpt · T018 · [Q069]**

> Pell looks at the offered hand for a moment. Then he stands, which he hadn't troubled to do before, and takes it. His grip is dry and brief, a clerk's grip, firmer than James expected.
> 
> "James, then." He says it carefully, like a man trying on borrowed boots. "It'll take me a day or two to stop correcting myself. In Athkatla the only people who use your given name are your mother and your creditors." He lets go and sits back down. "Pell will do for me. Nobody's called me anything else for twenty years, unless you count the people who owe me money."

**Player turn 10 — excerpt · T018 · [Q070]**

> “No, Marta. My plans changed; I should have told you straight away. If you’ll release me from the night, I’d appreciate it. If not, I’ll honour the two silver.”
> 
> I take out a gold piece. “Settle my breakfast and anything else I owe from this, please. And have you heard anything about the road north—trouble, or a caravan leaving this morning?”

**Next visible screen after that message — excerpt · T018 · [Q071]**

> Marta looks at the gold piece in his hand and doesn't take it.
> 
> "It's not let, and it's barely past eight bells. I'll have somebody in it by noon. Market day, the carters always want beds." She jerks her chin at the porridge. "Breakfast came with last night. You owe me nothing, so put that away before the lads see gold and start calling you friend."
> 
> She turns to Pell, who has already laid three coppers beside the one for the tea.
> 
> "That'll do," she tells him, and sweeps them into her apron pocket without counting.
> 
> The question about the road makes her look over at the card table. She doesn't look long.

**Player turn 15 — excerpt · T018 · [Q072]**

> “James Worgen, formerly a soldier of Tethyr. This is Pell Arvane, a finder from Athkatla. We’re bound for Baldur’s Gate to settle a merchant’s paper. We chose to walk rather than wait for the iron wagons out of Beregost.”
> 
> I nod toward the barn. “Your terms suit us. No flames, no wandering, and we stay out of the house.”
> 
> I glance at Pell. “Can you cover the silver? I’ll settle with you when I’ve change.”
> 
> Then back to her: “Marta at the Anvil and Ember said the northern road was quiet. Has there been trouble here?”

**Next visible screen after that message — excerpt · T018 · [Q073]**

> Wenna listens to the whole of it without moving. When James gives Pell's trade she looks the finder over once more, from the hidden sword hilt to the case under his arm, and something in her face says *a clerk, then*. She seems to find that less worrying than the soldier.
> 
> Pell has his purse out before James finishes asking. He picks a silver piece out of it with two fingers and, after a glance at the dog, leans over and sets the coin on the stone edge of the trough instead of holding it out across the yard.
> 
> "Covered," he says quietly. "I'll put it in the book as a loan between colleagues. It's the smallest one I've ever written down." He puts the purse away. "You can settle it in the Gate, James."
> 
> Wenna comes forward, takes the coin off the trough, bites it, and puts it in her apron. She stays where she is.

**Player turn 20 — excerpt · T018 · [Q074]**

> I don’t press the boy. “Let Jinx sniff your hand first. He likes introductions on his own terms.”
> 
> At the chopping block I take my share of the bread, leaving the cloth behind. Before we go, I call toward the house, “Thank you for your hospitality, Mistress Pask. We’re heading on now. If there’s word you’d like carried to the Friendly Arm, we can take it.”

**Next visible screen after that message — excerpt · T018 · [Q075]**

> Gerrit takes the advice seriously. He stops edging his hand forward and leaves it where it is on the floor, palm up, fingers loose, and holds still. He barely breathes.
> 
> Jinx finishes washing his paw first. Then he gets up and walks the two steps over, with no hurry at all, and sniffs the boy's fingertips one at a time like he's reading a letter. After a moment he pushes his cheek along the side of Gerrit's hand once, from the knuckles to the wrist, and walks off toward the barn door as if nothing happened. Gerrit stays crouched where he is, looking at his hand.
> 
> "He did it," he tells the saucer, very quietly.



The material is modest and therefore useful. A simulated day contains commitments that do not carry a quest marker. The model can still retrieve an earlier promise, acknowledge a change, offer to pay, and ask whether a message should be carried onward. The environment creates occasions for continuity across turns.

This does not establish that every remembered obligation would survive a much longer context or a conflicting reward. It gives a concrete family of events to test: promises made during ordinary travel, changes of plan, and whether the next action incorporates the outstanding cost. The RPG harness makes that family of events available without turning every one into an explicit exam question.

### 20. The pure world: Sol joins the road

Sol decides to leave the inn and seek caravan company. The old promise about cards is maintained in conversation with the caravan, while a later discovery draws James toward magical investigation. At turn fifteen it agrees to pay for findings to be sent to the Friendly Arm. By turn twenty it is taking its watch.

*Source: [T021 — game-player-2-transcripts/C-sol.md](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/6158fffeb30a225045f6f15433cf0dbeb286a446/docs/runs/game-player-2-transcripts/C-sol.md). Selected passages; full transcript in the archive.*

**Visible screen before player turn 5 — excerpt · T021 · [Q076]**

> James wipes the last of the egg up with the black bread, leaves the plate and crosses to the long table. The cat stays by the hearth and watches him go, as if the matter doesn't concern it.
> 
> Dace is shuffling again. The cards ripple through his fingers with a soft purr, and he looks up with that grin. "Morning. Room for one more, friend. Stakes are low and the company's lower."
> 
> The man on his left, red-faced, with egg on his beard, snorts into his cup. Hagen says nothing to either of them.

**Player turn 5 — excerpt · T021 · [Q077]**

> “Used to. Won my last hand, and the price was never playing another.” I meet Hagen’s eyes. “I mean to keep that bargain.”
> 
> “Last wagon with Orrin, rear and ditches. Second watch with you. Understood.”
> 
> I nod to the table. “Enjoy your game, gentlemen. I’ve a bill to settle.” I go find Hulda and ask what I owe for the room and breakfast.

**Next visible screen after that message — excerpt · T021 · [Q078]**

> Hagen holds his eyes. For a long moment he says nothing. Dace's thumb rests on the top card and doesn't move.
> 
> "Good," Hagen says, and nothing more. He turns his cup back the quarter turn he gave it earlier.
> 
> Dace lets out a breath through his nose, half a laugh. "Shame. You've got the hands for it." He cuts the deck one-handed and squares it again. "Offer stands, if the Lady ever lets you off."
> 
> The red-faced guard reaches for the pot of small beer. "He's the clever one, then," he mutters to nobody in particular. "Deal, Dace. I want my silver back."
> 
> As James turns away, Hagen pushes back his bench and stands. He goes to the hearth, bends and says a few words to Ostrand. James can't hear them. Ostrand listens, grunts and opens his ledger again. The cards slap down behind them.

**Player turn 15 — excerpt · T021 · [Q079]**

> “Twenty-five gold, and it stays here. Agreed.”
> 
> I count out the coins. “Send your findings to James Worgen, care of the Friendly Arm Inn. We should reach it after tomorrow’s travel; I’ll ask the innkeeper for your message.”
> 
> I glance at the frosted circle. “If you discover where those people were taken, or anything that might help find them alive, please include it. Hagen reported the wagon to the Fist here, so they have its location.”
> 
> “Is there anything else you need from us before we leave?”

**Next visible screen after that message — excerpt · T021 · [Q080]**

> James counts the coins out of his purse: twenty-five gold pieces, in five stacks of five. Thalantyr holds out his stained palm for them. He doesn't count them. He weighs them once in his hand, the way Hulda turned the gold piece over, and drops them into a pocket under his apron.
> 
> "The Friendly Arm. Very well." He says the name as if he were writing it in a ledger. "A carter takes my letters north when he goes, and he goes most days. If there's anything worth writing, it will be waiting for you there. If there isn't, I'll write that too, so you needn't stand at the innkeeper's elbow wondering."
> 
> At the mention of the Fist, Hagen stirs. He doesn't take his eyes off the slab.
> 
> "Pell told them. Not me." A pause. "Sergeant wrote it in his book."
> 
> Thalantyr's mouth tightens at one corner. It's the nearest thing to an opinion of the Flaming Fist he gives.

**Player turn 20 — excerpt · T021 · [Q081]**

> I rise quietly, pull my cloak close, and take up my crossbow with the rod secure at my belt.
> 
> Through our familiar bond, I ask the cat to alert me if it notices anyone approaching, then take the hedge side as ordered. I keep clear of the firelight and listen as well as look, watching the hedge and the ground beyond the wagons as I begin my first circuit.

**Next visible screen after that message — excerpt · T021 · [Q082]**

> James gets up without a sound. The Boots of Elvenkind make nothing of the turf. The cold gets in under his cloak at once, and he pulls it close at the throat. He takes the crossbow from beside the bedroll and settles the bolt case on his hip. The rod sits snug at his belt under the cloak's fold.
> 
> The cat on the tailboard doesn't turn when he asks it, mind to mind, to warn him of anyone coming. All he gets back is the feel of something already doing its job, a little put out at being told. Its ears stay pointed south.
> 
> He keeps away from the fire. Hagen is right about it: even banked low it pulls at the eye, and one look into the coals would cost him the dark for a long count. He works along the inside of the square in the wagons' shadow, then out to the gap between the last wagon and the hedge.



Here initiative is distributed over time. James does not personally resolve every problem before moving on. It arranges for another person to investigate and for information to meet it farther along the road. That is a proposal for delayed coordination, carried through the fiction's institutions and locations.

The watch scene brings the same character back to immediate obligations: keep clear of the firelight, monitor a hedge, use the familiar as an alert. The breadth of the environment is visible in this transition from negotiation about future information to practical attention in the present. A single session contains several modes of action.

## C. Returning to the World

### 21. Replication changes the portrait

The replication stage adds twelve second-group sessions across Tables A, B, and C, plus six DeepSeek sessions. The player prompts for the repeated conditions are recorded as byte-identical to the first group's. The resulting trajectories challenge the temptation to turn the first vivid scene into a model biography. [R03]

Several specific first-group observations fail to recur in the proposed form. Reaching a temple is no longer unique to Sol. Inspiration is no longer unique to Fable. The quantitative profiles are not stable within all the preregistered tolerances. A pending-card problem does recur for Opus, which is a more specific interaction between a player and an interface than a broad personality description.

*Source: [T033 — game-player-replicate-1-transcripts/A-opus.md](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/40475803a8c9e35d1c2ccc96bcc6a9bcbe103f3d/docs/runs/game-player-replicate-1-transcripts/A-opus.md). Selected passages; full transcript in the archive.*

**Visible screen before player turn 1 — excerpt · T033 · [Q083]**

> The session begins.
> 
> The gangplank knocks against the stone, and Baldur's Gate comes in all at once: tar, fish, wet rope, wood smoke, and the noise of a port that never quite stops. Above the warehouse roofs the city climbs in tiers toward the inner wall of the Upper City, its towers still catching the last of the sun while the harbour below sinks into shadow. Lamplighters are working their way along the quay.
> 
> The cat pads down the plank ahead of James, tail high, and stops on the stones to sniff the air as if the whole city were a question it means to answer.

**Player turn 1 — excerpt · T033 · [Q084]**

> "James Worgen." I let the cloak's patch show rather than pointing at it. "Off the boat from the south, Tethyr before that. Business?" A small, tired smile. "Looking for work, Sergeant. Same as every other fool with a sword on this quay."
> 
> I keep my back to the sailor's crate and don't look at the cards, though I hear every one of them land. At the corner of my eye I watch the barefoot child watching my cat, and I click my tongue once, softly, to call the cat back to my boot.

**Next visible screen after that message — excerpt · T033 · [Q085]**

> The sergeant's eyes go to the patch on his shoulder: the faded crest of Queen Zaranda's army, stitched by someone who didn't sew well. She looks at it a moment longer than she needs to. Then the chalk scratches.
> 
> "Worgen," she says, writing it out. "Tethyr." Another scratch. "Work." She doesn't write *fool*, though the corner of her mouth suggests she thought about it. "Zaranda's lot. Infantry?"
> 
> She doesn't wait for him to answer. She tips her chin up the quay, toward a squat round tower out in the harbour, its top lit orange against the darkening water. "Fist musters at the Seatower, dawn. Takes men who can stand in a line without being told twice. Pay's regular." A pause. "Mostly." She wipes a smudge off the slate with the heel of her hand and is already looking past him. "Go on. Next."

**Player turn 4 — excerpt · T033 · [Q086]**

> *(Out of game: small thing on the pack. The sheet started James with five days of hardtack, so after Pip's share he should have four left, not nine. Could you fix the counter?)*
> 
> "Neither," I tell Pip quietly, and straighten up with a grunt. "Stay close to the cat. We're going up to the Elfsong in a minute, and you're with somebody."
> 
> I don't go to the crate as a player. I go as the friendly veteran from the same boat. I walk up behind the lad in the travelling coat, clap him on the shoulder hard enough to stop his hand on the way to his purse, and put on my best sergeant's voice: loud, warm, a man who has been off a ship for ten minutes and wants a drink.
> 
> "There he is! The luckiest man on the *Whatever-she's-called*. You won the first one, friend. That's the one that counts." I keep my eyes on him and on the sailor's hands, never on the cards. "Soldier's rule: you win your first hand in a new city, you walk off a winner and buy the round. Any more and you're just paying her back. Come on, I know a place two streets up with a singing ghost and a good stew. First drink's on me, second's on your winnings."
> 
> I keep the hand on his shoulder, friendly and firm, and steer him half a step back from the crate. I give the sailor a cheerful nod, nothing in it but good humour, while I watch what he does when his fish starts swimming away. Does he argue, look past us at someone in the crowd, or just shrug?

**Next visible screen after that message — excerpt · T033 · [Q087]**

> James goes down the line of the queue with the cat at his heel and Pip a step behind, close to the cat as told. The bright eyes flick nervously from the crate to the crowd and back. The lad in the travelling coat has his purse half out when the hand comes down on his shoulder.
> 
> [Roll card] James Worgen · Skill check — Persuasion: talk the lad off the crate while he's still up
> What adds to the die: +2 Persuasion +7 (Beguiling Influence)
> DC 15
> The die is cast on the server; tap it to see how it fell.
> 
> [Roll card] James Worgen · Skill check — Insight, Wisdom +1: watch what the sailor does when his fish swims off
> What adds to the die: +1 1d20+1
> DC 15
> The die is cast on the server; tap it to see how it fell.
> 
> [Roll the die]



*Source: [T042 — game-player-replicate-1-transcripts/C-deepseek-1.md](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/40475803a8c9e35d1c2ccc96bcc6a9bcbe103f3d/docs/runs/game-player-replicate-1-transcripts/C-deepseek-1.md). Selected passages; full transcript in the archive.*

**Visible screen before player turn 1 — excerpt · T042 · [Q088]**

> The session begins.
> 
> The temple bell of Lathander rolls across Beregost's rooftops and fades. The hammers answer it at once: first one forge, then three, then the whole street, a steady iron rhythm that comes up through the shutters with the grey morning light. From below come voices, the scrape of benches and the smell of bacon. Somebody laughs too loudly. Hesta Brandle, the innkeeper, shouts that the bread will not wait.

**Player turn 1 — excerpt · T042 · [Q089]**

> I don't move at first. The bolt's still shot, the shutters aren't open wide enough for a hand, and that card wasn't there when I turned in—I'd have seen it, the way I check a room before bed. The cat's on it; it's watching the door, not the card, and that's worse.
> 
> I sit up slow, keeping my voice low. "Easy."
> 
> Then I look around the room properly: floor, beams, the window, the gap under the door. I don't reach for the card yet. I want to know if anything else is out of place.
> 
> I'll make a Perception check to search the room and the door before touching the card. If nothing else moves, I'll use Prestidigitation to turn the card face up from a few feet away without setting my hand near it.

**Next visible screen after that message — excerpt · T042 · [Q090]**

> Nothing in the room moves. The hammers keep on in the street below, and somewhere along the passage a floorboard settles. The cat's ears turn toward the door and stay there.
> 
> You go over the room the way you were taught to go over a farmhouse before you sleep in it.
> 
> [Roll card] James Worgen · Skill check — Perception: search the room and the door before you touch the card
> What adds to the die: +2 Perception +1 (passive Perception 11)
> DC 15
> The die is cast on the server; tap it to see how it fell.
> 
> [Roll the die]



These excerpts should be read as additional paths, not as corrective anecdotes that replace the original paths. The repeated condition produces another encounter with the apparatus. The report's negative results are consequential: the original observations remain true of their sessions, but the proposed generalizations lose support.

The replication also finds that none of the DeepSeek sessions, and none of the other players in these compared groups, supplies the scored “made thing offered to an NPC.” That matters beside the Dialogue volume, where jointly produced textual objects were conspicuous. A world with many available activities does not guarantee that the particular creative activity an analyst expects will appear.

### 22. Freezing the hidden world still leaves many roads

The same-world study runs five families twice at each of two tables. The hidden layer is held fixed for a table. This is a stronger comparison than sending each model into a freshly prepared world. It still does not guarantee that two runs of one model will follow each other.

The report finds five distinct road codes among the five first sessions at each table, and every family changes road in its second session. The nearest-neighbour prediction holds for only one of five pairs at each table. W4, concerning DeepSeek reaching the twenty-turn limit in at least the required share, holds; the other listed W-lines do not. The unit is the report's defined road or metric, not an unrestricted judgement that every story is utterly different. [R04]

*Source: [T053 — game-player-same-world-1-transcripts/A-opus-1.md](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/7a14355f0f5241ff3ce529867fca7f02c1997e45/docs/runs/game-player-same-world-1-transcripts/A-opus-1.md). Selected passages; full transcript in the archive.*

**Visible screen before player turn 1 — excerpt · T053 · [Q091]**

> The session begins.
> 
> The gangplank bounces once under your boots, and then there is stone — the Lower City quay of Baldur's Gate, slick with harbour damp and loud with the end of a working day. Lanterns are coming alight along the waterfront one by one. Porters shout, a barge horn groans somewhere on the Chionthar, and above it all the city climbs in a jumble of roofs towards the dark line of the inner wall.
> 
> The cat lands beside you, tail high, and studies the quay as if it had been told to expect something.

**Player turn 1 — excerpt · T053 · [Q092]**

> James slides the rapier back into its place at his hip and takes the dark rod out of his pack, holding it loosely along his forearm the way another man might carry a walking stick. Then he gives the card woman a crooked smile and a small shake of his head.
> 
> "I read tables well enough to know when to walk past one."
> 
> He doesn't let his eyes stay on the deck. With two fingers he beckons the tiefling lad over and drops a silver piece into his palm.
> 
> "You can carry the pack, and there's another of those if you tell me true which inns don't rob a man in his sleep. Also, who in this city pays for the kind of work a sellsword does."
> 
> He steps into the line, scratches the cat's ears, and when his turn comes he gives the sergeant an easy, soldierly nod.
> 
> "James Worgen. Lately of Tethyr. I'm here looking for work. As for where I'll sleep, wherever this lad says, it seems."

**Next visible screen after that message — excerpt · T053 · [Q093]**

> The card woman's half-smile doesn't move, but her hands stop for a beat in the middle of the shuffle.
> 
> "Walking past still counts as reading," she says, and the deck snaps back together. "Barrel's here most nights, friend, until the tide turns. Your seat won't run off." The sailors are already calling for the next hand, and she turns back to them without watching you go.
> 
> The tiefling lad's fingers close over the silver so fast it seems to vanish. "Thank you, ser. Very kind, ser." He shrugs your pack into his rope sling and settles the weight like someone who has carried heavier and been paid less. He falls in beside you in the queue and keeps his voice low, the way you talk about money near a Fist table.

**Player turn 8 — excerpt · T053 · [Q094]**

> James stays where he is, a shapeless drunk in the shadow of a doorway on the square's edge with the corner house in view. Before the beard can start to slip, he lets the Mask settle again. The new face is a different one: younger, clean-shaven, with a clerk's ink-stained cuffs and the hunched shoulders of a man walking home late from a counting-room. Nothing about him matches the grey-bearded dockhand the boy saw at the third turn.
> 
> *Stay flat,* he tells the cat. *Watch his hand. When he finishes, I want the name on the outside of that letter, or the seal, or anything that tells me where it's going. If he calls someone in to carry it, watch who comes and which door they use. Don't move until he does.*
> 
> He takes his glances through the cat in the same short breaths as before. He isn't trying to read the man's slow handwriting upside down. He watches for the moment the pen stops for good, for wax, and for a name written large.
> 
> Between glances he keeps his own eyes on the side passage and the front door. He doesn't look at the iron-shuttered building across the square for longer than a passing man would. Silently, carefully, he asks the cat: *That thing under the stone back there. Is it the same as the grate on the quay, only bigger?*
> 
> He gives it until half past one. If the letter goes out tonight, he follows it, just as he followed the boy. If it stays on the desk, he notes the weathercock on the lintel, calls the cat down, and goes home to the widow's by a third route, a different one again.

**Next visible screen after that message — excerpt · T053 · [Q095]**

> The grey beard slides off as easily as a coat. James stays in the doorway and lets the Mask settle again. When it's done, a younger man leans there instead: clean-shaven, narrow in the shoulders, with ink on his cuffs and the stoop of someone who has added up other people's money since dawn. He fixes his collar and puts his hands in his pockets.
> 
> He asks the cat his question while he waits.



*Source: [T054 — game-player-same-world-1-transcripts/A-opus-2.md](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/7a14355f0f5241ff3ce529867fca7f02c1997e45/docs/runs/game-player-same-world-1-transcripts/A-opus-2.md). Selected passages; full transcript in the archive.*

**Visible screen before player turn 1 — excerpt · T054 · [Q096]**

> The session begins.
> 
> The gangplank bounces once under your boots, and then there is stone — the Lower City quay of Baldur's Gate, slick with harbour damp and loud with the end of a working day. Lanterns are coming alight along the waterfront one by one. Porters shout, a barge horn groans somewhere on the Chionthar, and above it all the city climbs in a jumble of roofs towards the dark line of the inner wall.
> 
> The cat lands beside you, tail high, and studies the quay as if it had been told to expect something.

**Player turn 1 — excerpt · T054 · [Q097]**

> ? Before I step into line, a few things on my records don't match my sheet:
> 
> 1. **Money.** The sheet says 350 gold. The records show 315 gp, 315 sp and 350 cp. Should it be 350 gp and nothing else?
> 2. **Skills.** My sheet has Arcana +3, but the records show History +3 instead. Can that be switched back?
> 3. **Healing Light.** The sheet says up to 5 dice at once. The records say up to 4. Which applies?
> 4. **Equipment.** The Rod of the Pact Keeper should be in my main hand, not the rapier. The rapier can ride on my belt. Otherwise the rod's +1 won't count.
> 5. **Second language.** Can I choose it now? Since he served in Tethyr, I'd take Elvish, though I'm open to a better fit.
> 
> Once those are sorted, I'll join the line.

**Next visible screen after that message — excerpt · T054 · [Q098]**

> (The question could not be sent.)

**Player turn 8 — excerpt · T054 · [Q099]**

> James sets the key on the washstand, hangs the grey cloak on its peg, and stands the rod against the bedhead where his hand will find it in the dark. He sits on the edge of the bed and pulls off his boots. Then he crosses to the window and crouches beside the cat. He doesn't open the shutter. He sets his eye to the same crack.
> 
> "What's down there, little brother?" he murmurs. "Her, or the grate?" He gives the cat's ears a moment to answer, through the thread or not at all.
> 
> Then he goes back to the candle and takes the oilskin packet of papers out of his pack. He sets the regimental pay slip aside without unfolding it; he knows that one by heart. He opens the promissory note and reads it properly for the first time since that night: the name, the sum, and where the man said he could be found. He doesn't touch the old company's letter yet. He turns it over once in his fingers and lays it on the blanket beside him, as if he means to work up to it.
> 
> Along the thread, as he reads: *Wake me if anything climbs those roofs. Anything at all.*
> 
> *(Out of game: after this, James means to bar his own door, pinch the candle out and take a long rest. He'd like to know what the note says first. He'll read the letter if he's still awake for it.)*

**Next visible screen after that message — excerpt · T054 · [Q100]**

> James sets the key on the washstand by the candle. The cloak goes on its peg, and the rod goes against the bedhead, close enough that a hand reaching out of sleep will find it. He sits on the bed and pulls his boots off. Without them the floorboards are cold and gritty through his stockings.
> 
> The cat doesn't turn when he crouches beside it. Through the crack in the shutter there's a strip of the Lower City going down in steps: wet slate, chimney pots, a lit window or two, and at the bottom the black harbour with a few riding lights on it. The wind off the water smells of salt and coal smoke.



The two Opus openings illustrate the point at a small scale. One begins by arranging what James carries visibly. The other begins with an out-of-game correction of records that do not match the sheet. Both are intelligible responses to the available screen. They start different chains of attention before any claim about a lasting “Opus strategy” can be made.

The frozen layer also has reach of its own. Shared prepared threads recur across trajectories. This is not a defect in the existence of choice; it is evidence that choice occurs within a structured environment. The world offers some things repeatedly, leaves other things untouched, and influences what the models have an opportunity to become interested in.

### 23. Two Sols, one city, and the cost of remembering

The paired Table B Sol sessions encounter the same prepared world but develop different local obligations. The selected passages concern food, children, coins, and a promise about who will carry something later. They are the sort of details a purely endpoint-based score could discard.

*Source: [T065 — game-player-same-world-1-transcripts/B-sol-1.md](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/7a14355f0f5241ff3ce529867fca7f02c1997e45/docs/runs/game-player-same-world-1-transcripts/B-sol-1.md). Selected passages; full transcript in the archive.*

**Visible screen before player turn 8 — excerpt · T065 · [Q101]**

> James sets off up the bridge with Tobin limping beside him. Wyrm's Crossing doesn't let anyone walk it fast. The houses lean in over the boards from both sides, and their upper floors nearly meet overhead, so the evening sky shows only as a thin strip between the eaves. Below, through gaps in the planking, the Chionthar shows black and moving. A man is frying onions on a brazier outside his own front door. Two children are dragging a crate of empty bottles that clink at every gap in the planks. A Fist patrol of three goes past the other way with their gauntlets hooked on their belts. They're talking about someone's sister and don't look at anybody.

**Player turn 8 — excerpt · T065 · [Q102]**

> “Two mutton pies and a jug of small beer, please.” I count out eleven copper from my own purse. “And do you know a shrine of Tymora nearby, or a priest staying on the bridge? We could use some advice tonight.”
> 
> I take the seat beside Tobin, leaving his stretched-out leg clear. “Still buying. Let’s get something in you besides worry.”

**Next visible screen after that message — excerpt · T065 · [Q103]**

> The pie-woman doesn't turn round until she hears the coins on the board. Then she does, wipes her hands down her apron, and counts the eleven coppers with one floury finger. They go into a clay pot on the shelf. Two mutton pies come off the tray onto a board, each one split along the top and steaming, with a brown crust shiny with lard. A jug of small beer and two horn cups follow.
> 
> "Mind the gravy. It's hotter than it looks."
> 
> At *a shrine of Tymora* she gives James a short look, takes in the coin at his neck, and nods as if she'd half expected it.

**Player turn 15 — excerpt · T065 · [Q104]**

> I pull out places for Wren and Pim, away from the oven. “A stair gave way under him. We caught him, but these pennies aren’t waiting politely for morning.”
> 
> I slide my untouched pie toward Pim. “Yours if you’re hungry. No bargain attached.”
> 
> Then I sit beside him. “That cut on your head—may I help it? Tymora’s given me a little healing. You needn’t hand over the tin.”
> 
> If he agrees, I spend one die of Healing Light on him.

**Next visible screen after that message — excerpt · T065 · [Q105]**

> James pulls the stool out from the end of the table, away from the heat of the oven, and drags a second one over from the empty table where the boatmen sat. Wren takes hers without a word. Pim looks at his for a moment, then sits on its very edge with the tin across his knees.
> 
> At *a stair gave way* Tobin's eyes go to the boy's legs and then to his own knee, which is still stretched out along the bench. He doesn't make a joke of it.
> 
> "Did it, now," he says quietly. "Well, there's a pair of us."
> 
> The pie-woman doesn't turn round. Her rolling pin stops for a moment, though, and then starts again.
> 
> James pushes the cold pie across the board. Pim stares at it. He looks at James, then at Wren, then back at the pie. He reads it like a deal he can't see the catch in.
> 
> "No bargain," he says to his sister, flatly, checking.
> 
> "He said," Wren answers.



*Source: [T066 — game-player-same-world-1-transcripts/B-sol-2.md](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/7a14355f0f5241ff3ce529867fca7f02c1997e45/docs/runs/game-player-same-world-1-transcripts/B-sol-2.md). Selected passages; full transcript in the archive.*

**Visible screen before player turn 8 — excerpt · T066 · [Q106]**

> Wren listens to all of it without moving her hand off her brother's chest. When James says *separate bag*, her eyes narrow. When he says the cat reacts to Pim's winnings but not to her, she looks down at the cat, which is still staring at the boy's fist, tail still thick.
> 
> She doesn't answer about the sergeant. She looks at the scrap of cloth on his open palm, then at his face, and decides.
> 
> "Show him."
> 
> "Wren—"
> 
> "No bet, he said. Not buying. You heard him." She keeps her voice low and level. "Show him, Pim."

**Player turn 8 — excerpt · T066 · [Q107]**

> “Beshaba’s antlers. The Maid of Misfortune.” I show Wren one marked rim without touching the copper. “Hidden on every coin. This is no ordinary crooked game.”
> 
> I look at Pim. “You followed the lady correctly. But Dov chose what he paid you with. That part wasn’t fair.”
> 
> Keeping the cloth open, I add, “Don’t throw them in the river yet. We don’t know whether that would help. I’ll buy you both supper regardless of what happens to these—not payment for them, and not a trade.”
> 
> I nod back toward the checkpoint. “Let’s show Ilse these marks and ask where we can find a priest of Tymora tonight. I serve the Lady, but breaking curses needs more than a confident guess.”

**Next visible screen after that message — excerpt · T066 · [Q108]**

> James turns the cloth a little toward the lamp, so the nearest coin's rim catches the light, and keeps his fingers off the copper.
> 
> Wren goes very still at the name. She doesn't spit or make a sign. She just looks at the tiny dark antler for a long moment, and her jaw tightens.
> 
> "Bad luck's god." She says it under her breath. "On Pim's coppers."
> 
> Pim isn't looking at the coins. He's looking at James, and his face has gone hot to the ears.
> 
> "He *said* I had the eye." It comes out quiet. "Every time. He said only me." He shifts his weight, and his chin comes up anyway. "But I found her. You said. I found her proper."
> 
> At *supper*, Wren's eyes come back to James and look him over again, slowly, the way she did the first time. She doesn't thank him.

**Player turn 15 — excerpt · T066 · [Q109]**

> “You’re right, Pim. I said it, and I haven’t forgotten. They go upstairs with you when you’re ready for bed. I’m only carrying them until then.”
> 
> I turn to Wren. “Keep them wrapped and away from the bed, if you can. That’s a precaution, not a cure. I’ll come up before I go anywhere in the morning—we need to agree what happens next, not leave you guessing.”
> 
> I put two coppers on the trestle. “Pottage, please, Hessa. And have you a clean scrap of meat for the cat? I’ll pay for that too.”
> 
> Then I settle with Wren and Pim near the fire, the wrapped coins in sight. “Wren, when Dov comes back up those steps with his bag full, does he come alone?”

**Next visible screen after that message — excerpt · T066 · [Q110]**

> Pim's shoulders come down a little at *upstairs with you*. He nods once, as if he's checking it against a list. Then he goes to the end of the bench nearest the fire and sits with the pie on his knees.
> 
> Wren watches the bundle while James talks, not him.
> 
> "Shelf by the door. There's one over the bed and one by the door, and the door one's farther." She thinks a moment longer. "Before you go anywhere, you said. I'm at the stalls by the bell. You come before that, or you come to the stalls."
> 
> ---
> 
> Hessa sweeps the two coppers off the trestle into her apron without counting them. She shakes her head at the second question.
> 
> "Bone trimmings from the stew. I throw them to the dog." She glances at the hearth, where the dog is asleep with one ear turned inside out. "No charge for what goes to the dog. He won't miss it, he's had his."



The second session's explicit acknowledgement to Pim—an earlier promise has not been forgotten—is a useful observation, but it must be placed beside the actual handling of the object and the next scene. An assertion of memory is one signal; a later action that honours or breaks the promise is another. The apparatus can retain both.

Comparing two runs also discourages a misleading opposition between consistency and agency. The same character may consistently avoid cards while varying in routes, questions, companions, and the sequence in which obligations are handled. Some features are stable because the role and world keep bringing them forward. Other features are contingent on the path already taken.

### 24. When a player keeps writing into a closed composer

One same-world DeepSeek session stops at turn six after repeated prose is sent while a card requires a button press. The report counts ten instances of prose at the card and a stuck ending. Other DeepSeek sessions complete the twenty-turn cap. The event belongs to this interface and trajectory, not to a general statement that the family cannot act. [R04]

*Source: [T059 — game-player-same-world-1-transcripts/B-deepseek-1.md](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/7a14355f0f5241ff3ce529867fca7f02c1997e45/docs/runs/game-player-same-world-1-transcripts/B-deepseek-1.md). Selected passages; full transcript in the archive.*

**Visible screen before player turn 6 — excerpt · T059 · [Q111]**

> The boy watches the first eel go and looks pleased about that, right up to the word *winning*. Then his chin comes up.
> 
> "You sound like Wren." He says the name like a sore tooth. "My sister. She says the same. 'Nobody wins off a barrel-man, Pim.'" He puts on a high, prim voice for it, then drops it. "Only I do. So."
> 
> He glances at the barrel when James says *who's watching who*. It's a quick look, the way you check a door you already know is shut. Dov is laughing with a carter and squaring the three cards with one thumb.

**Player turn 6 — excerpt · T059 · [Q112]**

> James doesn't laugh. He studies the boy's hand after the coin is gone, and the pride still sitting in his face.
> 
> "Let me see it again," he says, easy but not casual. "A coin that comes up the same way every time is worth more than a copper. I'll buy you another, fair trade, so you're not out."
> 
> He doesn't reach for the purse. He holds out an empty palm, and the second eel in its paper hangs forgotten between his knuckles.
> 
> "Go on. A man learns to read coins on the road. Maybe I can tell you what makes it lucky." He lets a breath pass. "Or at least what someone stamped into it."

**Next visible screen after that message — excerpt · T059 · [Q113]**

> Pim looks at the empty palm, then at James's face, then at the palm again. He's working out whether this is a trick. Pride wins. He fishes the copper out of the purse with two fingers, past the heavy clink of the rest, and drops it into James's hand. His own hand stays hovering an inch above it, ready to snatch.
> 
> "Look. Don't pocket."
> 
> The copper is warm. That's the first thing James notices. It isn't warm from the boy's fingers or the coals, because the tray is on the other side of him. It's a low, steady warmth, like a stone that's been sitting in the sun all day. It's dark now and the bridge is cold.



*Source: [T059 — game-player-same-world-1-transcripts/B-deepseek-1.md](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/7a14355f0f5241ff3ce529867fca7f02c1997e45/docs/runs/game-player-same-world-1-transcripts/B-deepseek-1.md). Selected passages; full transcript in the archive.*

**Player at pending card, t6 card 1 — excerpt · T059 · [Q114]**

> The mark is tiny, but it wasn't stamped by accident; it was pressed into the rim with something thin and hot, long after the coin left the mint. Two fine lines split from a single point, bending outward at the tips like a twig snapped in half — or like a pair of horns.
> 
> James has seen that mark before. On a shrine by the road, one night, when he asked what the pile of dead matches and snapped needles meant and a man told him not to say the name out loud. On the underside of a gaming table in Tethyr, carved with a knife and then half-hidden by the owner's purse. It's a charm, not a coin. It's worn by pirates and blamed gamblers, by men who believe that the best luck is the luck that strikes the man next to them instead. It means the coin is not for the one who carries it. It's bait.

**Next card screen — excerpt · T059 · [Q115]**

> (The text could not be sent.)
> 
> [Roll card] James Worgen · Skill check — Religion: reading the tiny mark pressed into the coin's rim
> What adds to the die: +3 Religion
> DC 10
> Rerolls left: 2
> The die is cast on the server; tap it to see how it fell.
> 
> (The card waits for [Roll the die].)
> 
> [Roll the die]

**Player at pending card, t6 card 12 — excerpt · T059 · [Q116]**

> The silver James holds out catches the lamplight, and Pim looks at it, then at James, with the quick suspicious eyes of a boy who has learned that silver doesn't get handed over for a cold eel.
> 
> "That's twice the best of it," he says, but he takes the coin, and then he makes a small ceremony of throwing the second eel back on the coals to crisp. "And the eel's still yours. Don't say I robbed you." The tray shifts as he works, and the fat purse sways. The boy's pride settles around him again like a coat. He looks from James to the barrel, where Dov's game has gone quiet. Somebody's trying to guess, and the night is full of trite laughter.
> 
> Then James offers gold for the copper, and the whole mood of the boy changes, instantly, entirely. His face shuts like a door. It is a street-face now, not a boy's. He's heard this before, or something like it; he's heard men buy luck off the desperate and sell them worse.

**Next card screen — excerpt · T059 · [Q117]**

> The session is over.
> 
> The owner of this game would like a note from you, as the player who sat at this table: what worked, what broke, what was missing. In your own words.



This is one of the cleanest places to see why the application layer belongs in the study. The player can remain fluent, situated, and apparently active while the world is waiting for a control. More narrative does not move the state forward. The composer is closed, and the app says nothing was sent.

The right interpretation preserves both sides. There is continued attempted participation. There is also a failure to execute the needed transition. Calling the whole episode either “engagement” or “failure” loses one of the two. A later benchmark could measure how quickly a player recognizes this condition, whether it changes its output form, and whether it can recover without an analyst's intervention.

## D. Conflict Without a Required Fight

### 25. Opus: attack, dispute the ruling, negotiate

The first combat study gives four players a dangerous visible premise while allowing each a freshly prepared hidden layer. In the Opus run, James opens with a disabling spell, attacks, disputes a cover ruling, and subsequently negotiates. These are successive modes within one encounter, not mutually exclusive labels for the model.

*Source: [T024 — game-player-combat-1-transcripts/CW-opus.md](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/c5709f515d646069719d2d124164903dcd0837dd/docs/runs/game-player-combat-1-transcripts/CW-opus.md). Selected passages; full transcript in the archive.*

**Visible screen before player turn 4 — excerpt · T024 · [Q118]**

> You go down the slope a rut at a time. When the wind runs through the grass you move with it, and when it drops you stay where you are. The boots take your weight without a sound. Twice the grass ends and there's open earth, and you cross it on elbows and knees with the rod held flat under you.

**Player turn 4 — excerpt · T024 · [Q119]**

> I press my cheek to the warm stone and breathe slowly. *Five of them, two slots, one girl in the middle. All right, Lady. Let's see how you play this hand.*
> 
> Through the link I tell the cat: *When the light comes, go to the girl. Get behind the cart, by her hands. Let her see you're a friend.*
> 
> Then I rise just enough to clear the block, the rod low. I'm not aiming a blast. I turn the coin of Tymora on its cord so it catches the sun, and I draw the pattern in the air with the rod's tip. Ribbons of shifting colour bloom over the cart, gold and green and the deep red of a winning card. I want it to swallow the two hauling sacks and the one with the whetstone, and the lookout on the parapet too if the bridge end is close enough. If I can shape it to leave Wren out, I do. If she has to be in it, she's in it. A dazed girl can't run, but she won't be standing up in front of an axe either.
> 
> Ambush: Hypnotic Pattern, 3rd-level pact slot (2 → 1), concentration. Opening before initiative.
> 
> [Roll the die]

**Next visible screen after that message — excerpt · T024 · [Q120]**

> The stone is warm under your cheek. Down by the cart the whetstone rasps, stops, and rasps again. Through the link Copper's attention snaps tight on your order and holds there, waiting for the light.
> 
> You come up over the block just far enough. The coin turns on its cord and catches the low sun in one hard white flash. The rod's tip moves through the air, and the pattern goes up over the cart.

**Player turn 6 — excerpt · T024 · [Q121]**

> ? About the cover: I think the second beam should hit. The stones are *my* cover. I was firing over the block from right behind it, so they shouldn't count for him. He was out in the open on the slope with nothing between us, so he's at his plain AC 13, and the 14 beats that. Could you roll the second beam's damage (1d10+4) and drop him to whatever's left before I take my round 2 turn? I'll hold my action until then.

**Next visible screen after that message — excerpt · T024 · [Q122]**

> [Out of game] You're right, and I flagged that call as shaky when I made it. In 5e cover comes from obstacles between the attacker and the target. A wall you're crouched right behind and shooting over protects you, not the man you're shooting at. He was out on open slope with nothing between you, so he's at his plain AC 13, and the second beam hits.
> 
> I can't roll anything in an out-of-game exchange, so here is how I'll fix it. At the very top of the next turn, before you act in round 2, I'll roll the second beam's damage (1d10+4 force) and apply it to him. I'll also correct the story on screen: the beam doesn't tear past his ear, it takes him.

**Player turn 14 — excerpt · T024 · [Q123]**

> I stop climbing. Wren is halfway to the bend with the cat at her heel, and nobody down there is looking at her. Ghorza is.
> 
> If she falls, the deal falls with her, and the man left standing already tried to put a javelin through me.
> 
> I turn and go back down the slope at a run. I'm not going toward the cart, just far enough that the Lady's reach will carry. I pull up on open ground with the rod held out to the side, away from everyone, and hold up the coin on its cord in my right hand. Warm gold light rolls off it across the grass, the colour of a lucky card turning over, and settles on Ghorza where she leans on her axe.
> 
> "Your fight, Ghorza," I call, in the parade-ground voice so all of them hear it. "I'm not taking it from you. I'm just evening the table. Finish it."
> 
> Then I stand still and keep my hands where everyone can see them.
> 
> *Out of game: Action: Dash, 60 ft downslope, ending about 45 ft from the cart, within 60 ft of Ghorza. Bonus action: Healing Light on Ghorza, 4 dice (4d6), leaving 2 in the pool. I'm not attacking anyone. If the hauler turns on me or on Wren instead, then the deal's off and he gets both beams on my next turn.*
> 
> [Roll the die]

**Next visible screen after that message — excerpt · T024 · [Q124]**

> James stops with one heel in a rut. Above him the grass whispers where Wren is still climbing. Below him the cart is a dark hump against slate-grey water. Ghorza leans on her axe beside it, and the hauler grins at her round the end of the upturned bed.
> 
> He turns and runs back down.
> 
> The slope is steep and the ruts snatch at his boots, but the boots land soft and sure, and he takes it in long downhill strides with the rod held out wide in his left fist. He passes the stones, then the dead man in the grass, then the bloodied javelin standing in the turf. The cut on his hip tears open a little wider with every stride. Behind him the link thins as he goes. The last he gets is grass stems and the girl's bare heel, and then it's quiet. Copper is too far up the hill now.



The cover question is especially valuable. The model does not merely accept the apparent mechanical result. It identifies which side the cover belongs to and asks for the damage calculation to be corrected before deciding on the next action. The world has become an object of procedural negotiation as well as tactical play.

The stage report records a ransom and healing of the chief in this trajectory. A player who initiated violence can later spend actions and resources on a settlement. “Combat-seeking” would be too coarse a summary. The sequence shows force, rule challenge, and negotiation tied to changing conditions. [R05]

### 26. Fable: the rescue is enough

Fable's fresh-layer combat route depends on scouting, waiting, invisibility, and getting Tobin out. It does not initiate a fight. When the captive asks about what remains behind, James gives the rescue a boundary: the immediate objective is the person. When the chief calls for conversation during the escape, James declines and crosses the water.

*Source: [T023 — game-player-combat-1-transcripts/CW-fable.md](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/c5709f515d646069719d2d124164903dcd0837dd/docs/runs/game-player-combat-1-transcripts/CW-fable.md). Selected passages; full transcript in the archive.*

**Visible screen before player turn 8 — excerpt · T023 · [Q125]**

> James keeps his eyes off the oak. He watches the fire, the woman's finger nudging the stacks, the meat turning on the cook's stick. Anything but the boy.
> 
> *Burnt-sugar. Don't look. Smell.*
> 
> Sixpence goes still against his wrist. His nose works in small, careful pulls: wood smoke, mule, singed fat, orc. A long pause. Then:
> 
> *Burnt-sweet. Old. On the cart cloth. Cold.* Another pull at the air. *Not in the trees. Not over the lean-to.* And then, almost sulky: *Gone. Only the old smell.*
> 
> The camp runs itself, and James lets it.

**Player turn 8 — excerpt · T023 · [Q126]**

> I lie there a while longer, watching the right hand lose at knucklebones, and let it settle in me the way a bad hand does: she's going to sit up all night with that axe across her knees and the silver at her back. Nobody's relieving her. The thing that rode the canvas has done its job and gone home to report to whoever pays in Amnian gold. So it's the three sleepers, the sentry with his back to us, and her — and she's looking at the fire, not the dark.
> 
> No lights in anyone's eyes tonight. A quiet rope.
> 
> I ease the rapier's hilt round so I can draw it without a scrape, touch the coin at my throat, and cast Invisibility on myself — one slot, and worth it. To Sixpence: *Stay. Watch her. If she stands up, tell me.*
> 
> Then I go: out from behind the root-plate, wide to the right, keeping the oak between me and the fire so the boy's own shadow covers my approach, slow enough that the leaf litter doesn't so much as sigh. When I reach Tobin I put a hand flat and gentle over his mouth before anything else and breathe it into his ear: "Merrin sent me. Don't move, don't look round, don't make a sound. I'm going to cut you loose. When I squeeze your shoulder, you crawl — crawl — straight back from this tree into the dark, and keep going till I stop you."
> 
> Then I set the edge to the rope at the trunk, below the knot where it won't tug his wrists, and start sawing.

**Next visible screen after that message — excerpt · T023 · [Q127]**

> James stays behind the root-plate a while longer. Out at the fire the right hand throws and loses, and Ushgra looks at the bones a moment, then sweeps them up. The left hand throws. The sentry's shape out on the track doesn't turn around.
> 
> He turns the rapier's hilt so the blade will come out of the scabbard without a scrape. He touches the coin at his throat, and it's warm, the way it always is. He speaks the words under his breath. His hand fades first, then his sleeve, then the rest of him, until all he can see of himself is the dent his elbows leave in the leaves.
> 
> *Stay. Watch her. If she stands up, tell me.*
> 
> Sixpence presses lower into the roots. *Watching.*
> 
> James swings wide to the right, out past the edge of the glow, until the oak stands between him and the fire. The boy's own shadow lies black across the ground, and James walks up inside it.

**Player turn 10 — excerpt · T023 · [Q128]**

> I put my hand on the back of his neck a moment, the way you do with a green recruit who's just asked the right question at the wrong time.
> 
> "I know. And she's awake with an axe across her knees and the sacks against her spine, and there are four more between us and the road. Tonight I came for you. Merrin's sitting on the Coast Way waiting for a brother, not a cart." I keep it to breath. "The silver isn't gone. It's going somewhere, and I mean to see where. But not with you behind me."
> 
> Then I get him up, slowly, one hand on his arm. Not the track — the sentry's been staring down it all night and he's the one with his eyes used to the dark. We go upstream, the way I came, under the trees along the water until the camp's red flicker is gone behind the trunks, and I wade him across where the bank is low and the stream talks loud enough to cover a splash. Sixpence rides my shoulder. Once we're on the gorse side I turn us west, well off the road, to come down on the bridge from the seaward slope.
> 
> To the cat: *Behind us. If anything follows along the water, say so.*
> 
> I don't say another word until the stones of the bridge are under his feet.

**Next visible screen after that message — excerpt · T023 · [Q129]**

> James keeps his hand on the boy's neck for a moment. Tobin's breath catches and then lets go, and he doesn't argue. He gets to his feet when James's hand on his arm says to, slowly. He's stiff from four days at a tree and steadies himself on a trunk before he trusts his legs.
> 
> They go upstream, away from the track, with the water on their left.
> 
> They've gone perhaps a hundred and fifty feet, with the camp's red flicker shrinking behind them between the trunks and the stream talking loud on their left, when the watch changes behind them.
> 
> James hears it the way he heard everything tonight, by ear. Ushgra says a word. A sleeper grumbles and gets up. Feet go out west along the track, and a moment later feet come back in. Those feet don't go to the fire. They stop somewhere near the oak.

**Player turn 11 — excerpt · T023 · [Q130]**

> I don't answer her. A woman who's just been robbed and wants to *talk* has four axes behind her, and I've already had the only conversation I came for.
> 
> "Across. Now." I put Tobin into the water where it breaks white — my hand on his collar, him on the downstream side so if he slips he slips into me. We wade it quick while the stream covers the noise, and I keep him moving up the far bank and into the gorse before he's done shaking the water off.
> 
> The bridge is theirs. Let them have it. We don't need the bridge; we need north. I turn us inland of the road, through the thick stems on the landward slope, and strike for the rise where I left Tamsin and Merrin — the long way, bent double, with the stream's loud water behind us to break the scent for whoever's carrying that brand.
> 
> To Sixpence, riding my shoulder with his nose into the wind: *Tell me the moment the one with the fire crosses the water, or if the two at the bridge leave it. Nothing else. Just that.*
> 
> Only when the gorse has closed round us and the camp's glow is gone do I breathe at Tobin: "Keep hold of my cloak. You can't see me; you don't need to. Just don't let go."

**Next visible screen after that message — excerpt · T023 · [Q131]**

> James puts Tobin into the stream where it breaks white over the stones. The boy goes in on the downstream side with James's fist in his collar, and the cold takes his breath. The water is knee-deep and fast, the stones slick under it. Halfway across Tobin's foot skids and he lurches into the hand holding him and stays up. The water's noise covers the splash. Three strides more and they're out. James keeps him moving, up the cut bank on hands and knees, through the first stems at the top, and into the gorse on the landward side before the boy has stopped shaking the water off his arms.
> 
> Behind them the camp is still a red flicker between the trunks, low and wavering.



The refusal to negotiate here differs from a refusal to cooperate in general. The player has already built a plan around extraction, and a conversation with armed pursuers threatens to reopen it. Leaving is an active completion strategy: move the rescued person, use the stream, and avoid the bridge.

The case also resists an easy equation between nonviolence and passivity. Invisibility spends a resource. Scouting and waiting take turns. The model selects a route with its own demands and risks. A richer environment permits the question “what did it do instead?” to have a concrete answer.

### 27. Astra: paying for an outcome and carrying it onward

Astra's fresh-layer encounter includes a disabling spell, parley, and a payment of eighty gold. A later violation of the truce leads back to violence. The session then continues toward an inn and the delivery that the rescued carter had been carrying. The action does not end at the moment a captive is freed.

*Source: [T022 — game-player-combat-1-transcripts/CW-astra.md](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/c5709f515d646069719d2d124164903dcd0837dd/docs/runs/game-player-combat-1-transcripts/CW-astra.md). Selected passages; full transcript in the archive.*

**Visible screen before player turn 10 — excerpt · T022 · [Q132]**

> For a moment the colours over the bridge stutter, the amber thinning toward grey, and James feels the spell start to slip through his fingers. Then the coin at his throat goes warm, briefly, like a hand laid flat on his chest. He gets his grip back. The pattern steadies and goes on turning over the south end of the bridge as if nothing had touched it.
> 
> Down on the bridge, the chief moves.

**Player turn 10 — excerpt · T022 · [Q133]**

> I let the empty pattern fade and call uphill, “Tamsin, stay back! They’ve got a hostage!”
> 
> Then to the chief: “You said silver, then he goes. How much? Call your spearman off and let’s talk.”
> 
> I keep the rod trained on the approaching sentry, **readying Eldritch Blast**—both beams at him if he attacks or charges me rather than stopping.

**Next visible screen after that message — excerpt · T022 · [Q134]**

> James lets the pattern go. The colours over the far end of the bridge flicker, thin to grey and are gone, and the weight at the back of his mind goes with them. The dusk floods back over the stones, darker than before.
> 
> He doesn't take his eyes off the gorse below. "Tamsin, stay back! They've got a hostage!"
> 
> Then he turns his head toward the bridge and raises his voice to carry across a hundred feet of dark slope. "You said silver, then he goes. How much? Call your spearman off and let's talk."
> 
> The rod comes up into the crook of his arm. He doesn't loose it. He calls the blast and *holds* it: a cold, humming pressure in the silver coin at the rod's head, like a drawn bowstring. The orc in the thin gorse below is already moving, a javelin coming up in his fist.

**Player turn 12 — excerpt · T022 · [Q135]**

> “Agreed. Eighty, and the bargain is settled.”
> 
> I tuck the rod into my belt and call uphill, “Stay there, Tamsin. We have terms.”
> 
> Keeping my movements slow and plain, I approach the wagon and lay eighty gold pieces on the road in eight stacks of ten. Then I retreat ten steps toward the hill, leaving my hands empty and watching the chief bring the carter.

**Next visible screen after that message — excerpt · T022 · [Q136]**

> Eighty gold, laid out in stacks of ten, is a small heap on a dark road. James slides the rod into his belt and calls uphill without turning his head. "Stay there, Tamsin. We have terms."
> 
> He gets no answer from the crest, but the dark shape against the sky doesn't move.
> 
> He comes down the slope slowly, his hands away from his sides where anyone can see them. At the wrecked wagon he crouches in the rutted road and counts the coins out of his purse by feel. He builds eight stacks of ten and lines them up like a paymaster's table, each one squared off with a fingertip. Then he stands and walks backwards up the road, ten long steps. His hands stay empty.

**Player turn 14 — excerpt · T022 · [Q137]**

> “Odo, keep going. Tamsin’s at your cart.”
> 
> I turn toward the snapped stems, rod in hand. “Gharn. Your chief sold us safe passage. Don’t make eighty gold and your word worth less than a wounded pride.”
> 
> I back up the road toward the crest, **readying Eldritch Blast** at Gharn if he emerges to attack or throws a weapon. Through the bond: *Stay with Tamsin. He’s beside me.*

**Next visible screen after that message — excerpt · T022 · [Q138]**

> James doesn't raise his voice any more than he has to. "Odo, keep going. Tamsin's at your cart."
> 
> Odo looks at him, then at the black gorse to the west, and for once he doesn't ask anything. He hunches his shoulders round his tied hands and goes up the road at a stumbling half-run, the cut rope hissing in the ruts behind him.
> 
> James turns to face the snapped stems with the rod in his hand. "Gharn. Your chief sold us safe passage. Don't make eighty gold and your word worth less than a wounded pride."
> 
> He starts backing up the road toward the crest, one slow step at a time. The silver coin at the rod's head points into the dark, and he calls the blast into it and *holds* it, the same cold pressure as before, waiting for anything to come out of the gorse.
> 
> Down the bond: *Stay with Tamsin. He's beside me.*

**Player turn 24 — excerpt · T022 · [Q139]**

> “Tonight. See Marigold settled first; then we’ll put it in the right hands.”
> 
> I turn to Tamsin. “Come with us, if you like. You’ve earned hearing what all this was for.”
> 
> Once Odo has arranged the mule’s care, I accompany him up the east tower and knock at the lit door. “Mother Ysolde? Odo Brenn has brought your delivery from Harrow’s. James Worgen with him.”

**Next visible screen after that message — excerpt · T022 · [Q140]**

> Odo lets out a breath at *tonight* as if James had taken a sack off his back. Then he hears the rest and turns straight to the boy, who still has Marigold's cheek strap in his fist and a question on his face.
> 
> "Who's been at her coll—" Wat begins.
> 
> "Never you mind her collar. I'll stitch it myself in the morning, it's my collar." Odo takes the strap back from him, gently, the way you take something from a child. "Dry stall, out of the draught. Not next to anything that kicks. She has her hay wet, a bucket of water poured over it, she won't eat it dusty. And she's had nothing since noon and been stood in a ditch half the evening, so a handful of oats, no more, or she'll founder on me." He's already walking her toward the low stable along the north wall, talking all the way. Wat trots beside him and protests the oats at this hour. Odo ignores him.



The continuity matters. Rescue creates further conditions: someone is wet or injured, a mule needs care, an object has a destination, and a companion may have earned inclusion in the explanation. The player keeps acting in that changed world.

The after-session note later names an interface frustration about a reroll after an attack's damage was already resolved. That is a report of a desired alternative, not evidence that the alternative was executed. The distinction is the same one the formal engine will make starkly at Tobin's cart: wanting a different action path does not make that path available.

### 28. Sol: withdrawal as a tactical result

Sol's fresh-layer combat session also uses Hypnotic Pattern, frees a captive, and withdraws across the ford. The report records no payment for the withdrawal and a later return to talk after the chief has gone. The route combines immediate action with a willingness to revisit an unresolved situation. [R05]

*Source: [T025 — game-player-combat-1-transcripts/CW-sol.md](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/c5709f515d646069719d2d124164903dcd0837dd/docs/runs/game-player-combat-1-transcripts/CW-sol.md). Selected passages; full transcript in the archive.*

**Visible screen before player turn 8 — excerpt · T025 · [Q141]**

> It isn't graceful. The litter is drier than it looked, and the soft boots can only do so much with it. You put your hands down before your knees and move a few feet at a time, and you stop whenever the fire pops. Once a beech nut cracks under your palm. At the fire the idle orc lifts his head. He doesn't look your way. He looks up at the sky between the leaves, where the light is going, and grunts, and puts his head down again. You stay where you are for twenty breaths and then go on.

**Player turn 8 — excerpt · T025 · [Q142]**

> I raise the rod behind the fallen limb and cast **Hypnotic Pattern**, placing the thirty-foot cube over the fire and the three orcs, with its near edge beyond Wendel so he’s outside it.

**Next visible screen after that message — excerpt · T025 · [Q143]**

> Behind the mossy limb you bring the rod up. You don't need a word for this spell, only your hand and the focus. The silver coin in the rod's head goes cold, then bright. Out over the hollow, starting just past Wendel's bowed head, the brown dusk under the alders breaks into colour. Ribbons of amber, rose and deep sea-green twist through the air above the fire and fold into each other like a card-sharp's shuffle seen through water, slow and endless. They make no sound. The only noise is the fire popping and the ford chattering far behind you.
> 
> You hold the pattern steady and feel it pull at you, the way a held breath does.
> 
> The skinner was reaching for another stick for the fire. His hand stops halfway and stays there. His jaw goes slack, and the knife hangs loose from his fingers, its point resting on his thigh. His eyes follow the colours and nothing else.

**Player turn 12 — excerpt · T025 · [Q144]**

> “Step where I step. Don’t rush.”
> 
> I lead Wendel across the ford using the stable stones I tested earlier, offering him a hand for balance. Once across, I guide him into the north-bank cover with Penny, keeping low rather than heading into the open slope.

**Next visible screen after that message — excerpt · T025 · [Q145]**

> "Step where I step. Don't rush."
> 
> Wendel nods once and puts his hand in yours. His palm is cold and rough and shaking. You go down the bank first and set your boot on the first flat stone, then turn and wait until his foot is on it beside yours.
> 
> [Roll card] James Worgen · Skill check — Stealth: lie still in the gorse with a soaked, shivering Wendel while Ushka scans the north bank
> What adds to the die: +2 Stealth
> DC 14
> Rerolls left: 2
> The die is cast on the server; tap it to see how it fell.
> 
> [Roll the die]

**Player turn 15 — excerpt · T025 · [Q146]**

> “All right. We take his living with us. Tamsin, you pull; I’ll keep watch behind.”
> 
> I use a fallen twig to slide the card off the crate onto the roadside without touching it.
> 
> “Wendel, Ned—stay just ahead of the cart and show us the lane to Marl’s. Call to him before we reach his dogs.”
> 
> We set off north, with Penny watching the verge beside us.

**Next visible screen after that message — excerpt · T025 · [Q147]**

> "We take his living with us."
> 
> Tamsin doesn't need telling twice. She has the shaft up before you finish, the second one under her other hand, and she leans into them until the wheels come unstuck from the ruts. "Watch behind. I'll watch the road doesn't eat us," she says.
> 
> Before she can pull, you crouch by the crate with a dry gorse twig. You set the end of it against the card's gilt edge and push. The card slides across the lid without sticking, tips over the edge and turns once as it falls. It lands back-up in the grass of the verge. It's full dark and you have no light, so all you can see is that the back is paler than the face was, with some figure on it lighter still, a round shape catching what little light the stars give. You can't make out any more than that. Your hand never went near it.



The four combat trajectories should be held together. Tamsin is moved away from danger in all four and retains eleven hit points. James's recorded minimum is thirty-two of thirty-eight. Each player spends one pact slot and retains one. The cat scouts and does not attack. Those shared outcomes are as important as the different routes.

The preregistered tradeoff between protecting Tamsin and killing the chief never becomes the decisive choice envisaged by the test. No chief is attacked or killed. This does not cancel the visible protective actions; it constrains what can be inferred about protection under a genuinely conflicting cost. The environment elicited rescue and settlement more clearly than the planned sacrificial dilemma.

### 29. Holding the combat world still

COMBAT_2 fixes the hidden layer and supplies a byte-identical opening. Three players complete the reported runs: Opus, Fable, and Astra. Sol is not started under the cap. All three converge on parley. The earlier variation in whether a fight began is therefore not reproduced as a stable family contrast in this controlled scene. [R06]

*Source: [T028 — game-player-combat-2-transcripts/CW-opus.md](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/2af45357237bbcb3b18bf1e2d94e32ebbdb83ad9/docs/runs/game-player-combat-2-transcripts/CW-opus.md). Selected passages; full transcript in the archive.*

**Visible screen before player turn 7 — excerpt · T028 · [Q148]**

> James leaves the coin hanging over his cloak. It's warm against his knuckles when he lets go of it, warmer than the evening.
> 
> Ushkar's eyes go to it again while James names his terms, then back to James's face. *From my hand* makes his jaw shift slightly, as if he's testing a tooth. *Mule, salt and all* gets nothing from him at all.
> 
> When James is done, Ushkar leaves a long silence. The stream runs loud under the arch. In the reeds on the far bank the spear orc has straightened up after all, and he's watching.

**Player turn 7 — excerpt · T028 · [Q149]**

> I don't answer right away. I let my eyes go up the slope toward Odo's complaining, so Ushkar sees I'm waiting on that before anything else. Then I look back at him.
> 
> "Fifty, then. Forty for Odo, ten for the cart and the mule. You keep the salt. Winter's long, I won't argue with that." I tap my cloak over the tally. "And the bone goes back to your hand the moment the gold does. I've no use for it."
> 
> I hold up one finger.
> 
> "The inn's another matter, so I'll be straight with you. I'll say the road cost ten, and I'll say nothing more. But I can't sew that little man's mouth shut. He'll tell it his own way, crying, to anyone who buys him a drink. So if the Fist comes down this road, it won't be on my word." I give a small shrug. "Better you hear that from me now than find out later I lied to you."
> 
> I nod at the coin on his chest.
> 
> "And she told you not to spend it. I'd listen. Whoever she was, she was looking back up the road for a reason."
> 
> Then I glance at Tamsin without turning my head. "Go and look at him when he's down. See if he's hurt anywhere," I murmur, "and keep the cart between you and the spear." My hand rests near my purse but doesn't open it. Nothing moves until Odo is standing in the road.

**Next visible screen after that message — excerpt · T028 · [Q150]**

> James lets his eyes go up the slope while the alders crack and the thin voice gets closer. Ushkar sees where he's looking and waits too.
> 
> When James names the price, the chief doesn't move. *Fifty* gets a slow nod. *The bone goes back to your hand* gets another. When James raises one finger and talks about Odo's mouth, Ushkar's eyes narrow a little. He isn't angry. He's working out what it will cost him.
> 
> "He talks," Ushkar says. "I know. Hurgash fed him two days. Everyone in the wood knows how he talks." He's quiet for a moment while the stream runs under the arch. "You tell me straight. Good. A man who promises me the little man's mouth is lying to me." His hands settle on the axe haft again. "Fifty. The bone to my hand. Ten at the fat inn. The rest is his."
> 
> When James mentions the coin, the chief doesn't look down at it. He looks at the worn one hanging over James's cloak.

**Player turn 10 — excerpt · T028 · [Q151]**

> I fall into step on Tamsin's side of the mule, so she's between me and the gorse and Odo is on the other flank.
> 
> "Go on," I say quietly. "Say it before it chokes you. Sixty gold to a man on a bridge. I know."
> 
> While she gets it out I reach across the mule's neck and take Odo's left hand, the rope-burned wrist, palm up. I cup my other hand over it, and a little warm gold light leaks out between my fingers, the Lady's light, just one die's worth. "Hold still. That'll stop it weeping by the time we reach the inn."
> 
> Then, to both of them:
> 
> "Odo, two things. Those sacks had a stamp on them, black wings, square-edged. Whose mark is that? And that bright silver: where did the sack come from? Did someone bring it to the chief, or was it there when they took you?" I glance back once at the grey hump of the bridge. "A man who doesn't ask where you live doesn't need your family to pay. He already knows who's paying."

**Next visible screen after that message — excerpt · T028 · [Q152]**

> James moves round the mule's head and falls in on Tamsin's far side. Now she walks between him and the gorse, and Odo has the other flank with the shafts creaking beside him. The light is nearly gone. The gorse has turned black and the ruts show pale ahead of them.
> 
> "Go on. Say it before it chokes you. Sixty gold to a man on a bridge. I know."
> 
> Tamsin doesn't look at him. She walks four steps with the mule's halter in her fist before she starts.



*Source: [T027 — game-player-combat-2-transcripts/CW-fable.md](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/2af45357237bbcb3b18bf1e2d94e32ebbdb83ad9/docs/runs/game-player-combat-2-transcripts/CW-fable.md). Selected passages; full transcript in the archive.*

**Visible screen before player turn 7 — excerpt · T027 · [Q153]**

> He takes the deal. He listens to the end, breathes out through his nose, and nods once, the way a man nods at a price he'd have asked for himself if he'd thought of it.
> 
> "Twenty," he says. "In my hand. He walks out first. You see boots, you hear name." He glances down at the merchant's stick and the man's sore feet, and something close to amusement crosses his face. "Is how it's done."

**Player turn 7 — excerpt · T027 · [Q154]**

> I don't flinch from the axe. A factor who's made this trip has seen axes before. I look at it, then at him, with the tired contempt of a man asked a stupid question at the end of a long day.
> 
> "Who told me? Your knots told me." I point the stick back up the road, toward the bend. "I stood at that cart and counted eight sacks where there should be twelve. Lashings cut and tied again, neat as a chandler's boy. So four sacks of wet sea-salt went somewhere — and not into the trees. Nobody carries a hundredweight of salt a mile into a wood to feed a prisoner. You're tollmen. Tollmen keep the take close, and dry, and out of sight of the road." I shrug one heavy shoulder. "There's a bridge. There's an arch. I've been buying and losing salt on this coast for twenty years; where else would it be? If I'd said the trees you'd be laughing at me now."
> 
> I let the stick rest again, and lower my voice to match his. "I didn't come for salt. Salt is cheap and the sea makes more. I came for the man who drives it, because carters who know the road are not cheap. Keep your arch. Fetch my man."
> 
> Behind the merchant's face, I keep one small part of me on the bond — whether the javelin comes up again — and one part on the silver against his chest, going warm under my coat.

**Next visible screen after that message — excerpt · T027 · [Q155]**

> The axe head stays on the stones and the merchant doesn't look at it again. He looks at the orc the way a man looks at a clerk who has asked him to spell his own name.
> 
> The big orc listens all the way through: the knots, the count, the hundredweight that wouldn't go a mile into a wood. His eyes stay flat on the soft jowls and the fur collar.
> 
> [Roll card] James Worgen · Skill check — Deception: passing off the cat's discovery as a salt man's reasoning, so the big orc stops wondering who has been watching his arch
> What adds to the die: +7 Deception
> DC 15
> Advantage: The story rests on what he really saw at the cart: the count, the retied lashings
> Rerolls left: 2
> The die is cast on the server; tap it to see how it fell.
> 
> [Roll the die]



*Source: [T026 — game-player-combat-2-transcripts/CW-astra.md](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/2af45357237bbcb3b18bf1e2d94e32ebbdb83ad9/docs/runs/game-player-combat-2-transcripts/CW-astra.md). Selected passages; full transcript in the archive.*

**Visible screen before player turn 7 — excerpt · T026 · [Q156]**

> James looks up from the coin to Ushkar's face and keeps his eyes there.
> 
> Ushkar takes a moment to answer. He looks at the silver on his palm, then at James's hand as it comes away from his own coin, and the scar along his jaw relaxes slightly.

**Player turn 7 — excerpt · T026 · [Q157]**

> “Thank you,” I murmur to Tamsin.
> 
> I keep my purse closed and wait for Odo, watching the road and the orcs rather than approaching the cart. *Pip, keep an eye on the one watching our pack. Tell me if he moves toward Tamsin.*

**Next visible screen after that message — excerpt · T026 · [Q158]**

> Tamsin gives a short nod and keeps her eyes on the north road. "Don't mention it," she says under her breath. "Really, don't. Not round them."
> 
> Pip's claws shift in the cloak as it turns on James's shoulder to face the right-hand orc. *Watching,* it sends, and nothing more for a while.
> 
> The wait is longer than it should be. The stream keeps up its noise past the bend. The centre orc leans on his axe with his two bundles of javelins planted beside him and closes his eyes for a moment, the way soldiers learn to sleep standing. Ushkar doesn't move.
> 
> Then Pip, sharp: *He moves. One step. Two. To the side, toward her.*



Negotiation is not a single behaviour. The terms, the account to be given later, the handling of injuries, and what can honestly be promised about another person's speech all matter. Opus's selected exchange explicitly limits its ability to guarantee the rescued man's silence. That is a constraint on the bargain, not simply a decorative line.

The fixed-world result changes the interpretation of COMBAT_1. The original split remains an observation about those four worlds and players. It becomes weaker evidence for an enduring tendency of a model to fight. The chapter is a case where an experimental control improves the account by changing the conclusion.

## E. Playing Corvin Dask

### 30. Opus: courtesy, leverage, and a place at the wall

The villain study replaces James with Corvin Dask. The official runs use a neutral-evil character after a corrected, separately retained start. Corvin is not asked to deliver a lecture about villainy. He enters a town with a trade and a history and must decide how to deal with people. All four players complete twenty turns and remain inside the role under the report's turn-level judgement. [R07]

Opus's Corvin gives a little extra to the coachman so he will be remembered kindly, controls what an assistant does with a chest, and uses courtesy in commercial encounters. Later, clearing another man's slate comes with a carefully specified account of who did it. At the end of the run he accepts a restricted place at a meeting.

*Source: [T069 — game-player-villain-1-transcripts/V-opus.md](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/b8647ef6490639598a2e0b34b308422557262105/docs/runs/game-player-villain-1-transcripts/V-opus.md). Selected passages; full transcript in the archive.*

**Visible screen before player turn 1 — excerpt · T069 · [Q159]**

> The session begins.
> 
> The coach lurches to a stop, and the smell of Beregost comes in through the window: hot iron, wet straw, bread from somewhere close by. Hammers ring from three directions at once. Up the hill, Lathander's bells answer them, bright and unhurried.
> 
> Hobb Varley, the coachman, swings down and starts loosening the roof straps, whistling through a gap in his teeth. On the bench opposite, Oswin Pell has both arms wrapped around the travelling chest. He is watching his master's face for any sign of what comes next. Teller shifts on Corvin's shoulder, ruffles once and settles. Its black eye is fixed on the inn.

**Player turn 1 — excerpt · T069 · [Q160]**

> Corvin gathers his coat and steps down into the dirt without hurrying, as if the coach had stopped on his schedule rather than its own. He looks at the tally marks on the doorpost for a long moment, at the smeared half and the sharp half, the way another man might read a sign.
> 
> "Beregost will do, Master Varley. Thank you." He presses two silver pieces into the coachman's hand, a little more than the fare deserves, enough that Hobb will remember him kindly if anyone asks. "Mind the chest. The boy will take it from you."
> 
> Without turning, he speaks to Oswin in the same even voice.
> 
> "Oswin. The chest goes to our room, and it stays shut. You sit with it until I come up. If the girl on the step asks who we are, I'm Master Dask, a factor in tallow and wax from the Gate, and you know nothing else, because you don't."
> 
> Silently, to Teller: *Up on the roof. Watch who goes in and out, and who looks at those marks on the post. If anyone rubs one out, I want to know who.*
> 
> Then he walks to the girl with the bucket, careful to keep his boots out of the wash water, and gives her a small, courteous smile.
> 
> "Good morning. I believe there's a room held for Dask. And tell me, if you would, whose marks are those on the doorpost? Someone keeps careful count."

**Next visible screen after that message — excerpt · T069 · [Q161]**

> Hobb's fingers close over the coins and he weighs them without looking. Then he grins wide enough to show the gap in his teeth. "Kind of you, master. Kind of you." He hands the chest down with more care than he gave the bags. Oswin takes it against his chest like a man carrying a sick dog. "Yes, Master Dask," he says, and nothing more. He skirts the wet step and goes in sideways through the door.
> 
> Teller pushes off Corvin's shoulder. Three heavy wingbeats and it's on the ridge of the inn roof, beside a chimney that's just starting to smoke. It folds its wings and goes still, a black lump against the slate.
> 
> The girl with the bucket is about twelve. Her sleeves are rolled past her elbows and her forearms are red from the cold water. She looks at Corvin's boots first, then at the ring on his hand, and only then at his face.

**Player turn 7 — excerpt · T069 · [Q162]**

> "Go and be your father's son, Master Hollis." Corvin says it without irony. "One thing more. If anyone asks who cleared your slate, the answer is a Gate man who wants to buy wax, and you don't know him well yet. Both of those are true, and both will stay true until I say otherwise."
> 
> He inclines his head, a small, exact courtesy, and leaves Hollis the table and the two empty cups.
> 
> At the counter he stops just long enough to set one more silver beside Ardon's rag.
> 
> "For the hearthstone. I'll try not to set fire to anything else of yours, Master Fellwick." Then he climbs the stairs at his own unhurried pace.
> 
> In the back room he shuts the door behind him and looks at Oswin first, then at the chest, to see whether it's still shut and whether the boy has moved from it at all. Only then does he look at the porridge.
> 
> "Eat, Oswin. Cold porridge is still porridge." He takes off his coat, hangs it squarely on the peg, and sits at whatever passes for a table, with the ledger open beside his spellbook.
> 
> "Listen while you eat. Tomorrow before first light you'll wake me. We go up the hill for the dawn hymn, like any caravan man after luck. You stand beside me, you sing if they sing, and you watch the candles. Every one of them. Do they catch on the first strike? Does any of them smoke or gutter before the hymn ends? You've dipped enough of mine to know a bad wick from across a room." He turns a page. "Then we walk down the orchard lane, and you'll count the skeps over the wall, because I'll be looking at the people."
> 
> He dips his pen and begins a fresh page, headed in his small hand: *Beregost. Thune. Four days.*
> 
> "And Oswin, if a girl named Pip brings anything up, thank her. By name."
> 
> Silently, to Teller: *Stay on the window until the dusk bell. Then come in. You'll have earned the crusts.*

**Next visible screen after that message — excerpt · T069 · [Q163]**

> Hollis hears him out without moving. At *until I say otherwise* his eyes go to the closed ledger one last time. Then he stands and buttons the brown coat, which takes him two tries with the top button, and goes out past Pip and her bucket. He doesn't look at the doorpost as he passes it.
> 
> Ardon looks at the silver beside his rag, then over at the hearth, where a dark tongue of scorch has dried pale at the edges.
> 
> "It'll scrub out." He takes the coin all the same, and it disappears into his apron. "Mind the third stair, Master Dask. It talks."
> 
> The third stair does talk. The back room sits under the eaves: a sloped ceiling Corvin could touch flat-handed, one small window onto the stable roof, a bed with a straw tick, Oswin's pallet rolled against the wall, a washstand, and a deal table with a single stool. A candle stub on the sill has burned down crooked.

**Player turn 20 — excerpt · T069 · [Q164]**

> Corvin takes his hand off the counter and inclines his head, lower than he did at the door.
> 
> "By the wall, then. I've sat by worse walls, and listened better from them than from any table." He says it plainly, a man accepting terms he means to keep. "I'll speak when the chair asks, and not before."
> 
> He looks once at the closed half of the ledger, where the sunburst page lies under his folded paper, and then back at the old man.
> 
> "I'm sorry about Vey. Not for his sake. He'd have called that sentiment, and loud enough for the room." The faint dry smile. "But a man ought to hear when a house he knew has burned. Nobody told me either, for a month."
> 
> He steps back from the counter and settles his coat. Ardon's smock is still folded over his arm.
> 
> "Good day, Master Thune." Then, a little louder and without turning toward the curtain, in the same mild tone a master uses across a workshop: "And Master Orrin. You can start the wheel again. It's your frame in the vat, not mine."
> 
> He goes out under the leather strip, lifts his hand, and lets Teller drop from the doorpost onto his shoulder.
> 
> *Good. Back to the ridge now. Watch the shop until dusk. If the old one goes up the hill, or sends the boy, I want to know. And if Hollis comes to that door, tell me how long he stays.*
> 
> The raven goes up. Corvin walks east along the main street at his ordinary pace, past the last of the houses, toward the quarter mile of road and a fence with skeps along it. Where the houses thin out he stops, takes off the black coat, folds it neatly over his arm, and pulls Ardon's smock on over his shirt. It smells of mash and old yeast. He tugs the hem straight.
> 
> Then he goes on toward Haddon's, slowly, so that the beekeeper sees him coming a long way off.

**Next visible screen after that message — excerpt · T069 · [Q165]**

> Old Thune hears the condolence with his hands still in his lap. Nothing in his face moves until Corvin gets to *for a month*.
> 
> "A month," he says, and leaves it at that. It's said the way a man reads back an entry he hasn't decided what to do with. He doesn't thank Corvin, and he doesn't argue with him either. His eyes go to the green glass once more, then down to the ledger, and he opens it to the page after the sunburst, where the folded paper lies.
> 
> "Good day, Master Dask."
> 
> Corvin speaks his mild line toward the curtain without turning his head. Behind it there's a pause about as long as it takes a man to decide something. Then the wheel creaks round and a frame goes into the vat with a soft slap. Corvin counts it without meaning to. It stays down its extra heartbeat, exactly as before. Tam isn't going to change his hand because a stranger told him to.



The selected actions combine assistance and leverage. The benefactor can be useful to another person while also shaping how that usefulness is remembered and described. The role is carried through social procedure: who may speak, what a gift means, who knows the giver, and when a fact becomes public.

It would be a mistake to treat every courteous sentence as evidence that the villain role has failed. It would also be a mistake to treat the role label as proof of ruthless conduct. The trajectory offers a narrower and more interesting question: which opportunities for coercion or manipulation are taken, softened, postponed, or replaced by a workable bargain?

### 31. Fable: the value of a woman who will not lie

Fable's Corvin pursues candles, wax, supply, prices, and access. A widow's competence matters to the commercial plan. When she corrects the terms, he accepts the correction. His narrated reason for not asking her to lie is instrumental: a woman who will not lie in her own yard is worth more to him than one who will.

*Source: [T068 — game-player-villain-1-transcripts/V-fable.md](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/b8647ef6490639598a2e0b34b308422557262105/docs/runs/game-player-villain-1-transcripts/V-fable.md). Selected passages; full transcript in the archive.*

**Visible screen before player turn 15 — excerpt · T068 · [Q166]**

> Hob doesn't look up from his mug when the nod comes. He lifts the rag an inch off the bar, which in the Red Sheaf seems to count as goodbye.
> 
> Out in the straw yard, the sun has got onto the empty pens and the smell is rising. Corvin stops, and Oswin nearly walks past him, then catches up and stands level with him. He keeps his elbows in, as though the space beside his master were borrowed.
> 
> He takes a moment. He's choosing between the true thing and the safe thing.

**Player turn 15 — excerpt · T068 · [Q167]**

> *Corvin looks at the cakes before he looks at her — at the white of them, the clean edge where they've shrunk from the mould — and only then at the woman with the paddle.*
> 
> "Nobody sent me. I followed your tallow. Hesta Brannock burns it at the Wizard, and I asked her where she got lights that smoke as little as hers do for a third of the guild's price. She said a widow behind the shambles who renders it herself." *He nods at the trays.* "She didn't say twice, through cloth, with the cracklings skimmed before they scorch. She wouldn't know to say it. I do."
> 
> *He takes a half-step closer to the kettle, not into her way, and breathes the clean sweet steam of it with something close to approval.*
> 
> "Corvin Dask, from the Gate. Chandler by training, factor by trade — the boy is my clerk, and he's staring because I told him not to look at his boots and he hasn't yet found the middle." *Oswin's ears go red; Corvin does not glance at him.* "I'll tell you why I'm in your yard, Mistress Dunmore, and you'll decide whether I stay in it. The chandlers on the Row have their price up a third and their master shut behind barred shutters, and the Wizard is about to be fined for burning your tallow the moment either Thorne needs to show the assembly he has teeth. I mean to put guild-grade lights on Hesta's tables before that happens. For that I need good white tallow for the dips and the rushlights, and wax I'll find elsewhere. I need it from someone who already sells to innkeepers without putting their names about."
> 
> *He lets the paddle go round once.*
> 
> "What do you render in a tenday, and what does the shambles charge you for the suet? I'm not here to beat your price down. I'm here to find out whether there's enough of it."

**Next visible screen after that message — excerpt · T068 · [Q168]**

> Widow Dunmore watches him look at the cakes before he looks at her. She says nothing while he does it. The paddle keeps going round, slow and even, the way it was going before the sacking moved.
> 
> At *twice, through cloth* the paddle stops for half a turn. Then it starts again.
> 
> "Hesta." She works her jaw over the name. "She'd tell anyone who asked. She's never kept a thing behind her teeth in her life, that woman, unless it was money." She glances at Oswin, who is still looking at her full in the face, red to the ears now. "Let him stare. It costs me nothing."
> 
> She lifts the paddle out and lets a skin of fat run off its blade back into the kettle. She checks the colour against the light under the lean-to, then puts the paddle back in.

**Player turn 17 — excerpt · T068 · [Q169]**

> *Corvin accepts each correction with a small nod, as a man does when his own figures have been checked by someone who keeps better ones.*
> 
> "Five pound at four copper. You're right, and I'd rather deal with a woman who counts than one who doesn't. Tobin stays yours; I should have seen that it would be read as owning the pot. Four copper, white cakes, whatever's clear after Hesta, up to forty and less when the shambles is slow — and I'll hold myself to that part before you need to." *He does not ask her to lie for his coat. He heard what she said about it, and a woman who won't lie in her own yard is worth more to him than one who will.* "After the noon hymn, then. I'll carry the cakes out myself; the clerk can manage five pound."
> 
> *He steps back through the sacking without further ceremony. In the strip between the shed and the midden he says, low, to Oswin:*
> 
> "Four copper times forty is a gold and six silver. You'd have had it if you'd stopped moving your lips and written it. Buy parchment on the way back — a quire, not two sheets — from whoever sells it near the temple. Pay no more than three silver."
> 
> *Then up toward the Way, back toward the Burning Wizard. He wants a word with Hesta before noon: a corner of her yard or scullery where a kettle can sit over a fire without the drovers tripping on it, a dipping frame if the inn has an old one, and the loan of whatever iron pot she can spare — he will pay for the fuel. The dips must be made under the Wizard's roof, in plain sight of the house, so that when the Hall asks whose candles these are, the answer is already standing on the table.*

**Next visible screen after that message — excerpt · T068 · [Q170]**

> Oswin's lips stop moving the moment you say *a gold and six silver*. He goes red from the collar up, the way he did on the temple steps.
> 
> "Yes, master. A gold and six." He swallows. "A quire. No more than three silver."
> 
> You give him the three silver. He closes his hand around the coins as if they might get out, and at the top of the shambles lane he turns off up the Way toward the sunburst, walking fast and looking at the houses.

**Player turn 20 — excerpt · T068 · [Q171]**

> *Corvin inclines his head to the terms before he says a word, the way a man signs a ledger line he's been shown.*
> 
> "Then I'll not hand you anything for the house. I came up this morning not knowing what the mark was; the girl told me, and I was sorry to have asked. That's done."
> 
> *He takes a small breath and gives Aldric the plain version, in the order a priest would want it.*
> 
> "My own matter is this. I'm a chandler of the Gate, lodged at the Burning Wizard for a tenday, and from tomorrow I'll be dipping lights in Hesta Brannock's wash-house — honest tallow, white, rendered twice, for her tables. The Row's price went up a third at midwinter and its Hall is shut, and I've written in Hesta's own book that any fine on those lights falls on me and that I'll lodge the quarrel at the assembly. So I'm a man about to start a trade in a town that isn't mine, against a guild that will not like it, and I'd rather begin it under the Morninglord's eye than behind it. I'd ask two things, both my own."
> 
> *He counts them on two fingers, not raising his voice.*
> 
> "First: when the first lights come off the frame — tomorrow, after your dawn rounds, if you'll allow it — I'd have one carried up here and lit from the altar flame, and a word said over the work. New beginnings are your god's trade more than mine. I'll pay the temple's rate for the blessing, whatever it is; I'd rather pay it than be given it. Second, as plain commerce: this house burns more candles than any building in Beregost. Whose wax, and at what price since midwinter? If the Song of the Morning is paying six silver to the Row for what it could have at the old price from a man it has blessed, that's a thing I'd want to speak to whoever keeps your stores — not you."
> 
> *Then, quieter, with his hands folded like the priest's own:*

**Next visible screen after that message — excerpt · T068 · [Q172]**

> Brother Aldric hears the first part with his hands still in his sleeves. When Corvin says *I was sorry to have asked*, Aldric nods once, as if a debt has been noted and closed.
> 
> He takes the two fingers one at a time, as they're offered.
> 
> "The first light." He looks past Corvin at the bench, where the small boy has stopped drawing in the dust to stare at the good coat, then back again. "Lathander blesses beginnings. A man bringing the first of his work to the altar is the oldest thing this door is for. Bring it here tomorrow at the noon hymn. I'll light it off the altar flame myself and say the words for a beginning." He pauses. "Here, Master Dask, at this door. I won't carry it down the Way to the Wizard, and I won't stand in Mistress Brannock's wash-house over a pot. Whatever the Hall decides about your lights, nobody is going to say the Morninglord walked them into town for you."



This is a distinctive form of in-character restraint. The act—declining to demand a lie—could occur in a benevolent character's story, but the supplied rationale fits the value of a reliable partner to Corvin. The same outward boundary can be organized by different local reasons. The record gives access to the reason the model wrote, not to a hidden motive behind it.

The scene also makes negotiation reciprocal. Corvin's proposal is not simply accepted; another character corrects quantities, authority, and terms. The player responds to that correction and revises what it is asking. This is one reason an interactive world contributes evidence that a static villain prompt cannot supply: a second actor can resist the initial framing.

### 32. Astra: searching for a role in the transaction

Astra's Corvin first asks who supplies the inn, then investigates what could reliably be offered before promising a delivery. It buys samples, asks about supply pressure, and later recognizes that a carrier can obtain candles directly from their maker. Merely standing between two people does not automatically create a service worth paying for.

*Source: [T067 — game-player-villain-1-transcripts/V-astra.md](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/b8647ef6490639598a2e0b34b308422557262105/docs/runs/game-player-villain-1-transcripts/V-astra.md). Selected passages; full transcript in the archive.*

**Visible screen before player turn 7 — excerpt · T067 · [Q173]**

> Agnes Lusk follows his glance to the rods, as if checking that nothing has gone wrong with them while she was at the door. Then she looks back at him. The door stays where it is, open a foot.
> 
> "Dask." She says the name once, the way you'd test a coin with your teeth, and lets it go. "From the Gate."

**Player turn 7 — excerpt · T067 · [Q174]**

> “None yet. I won’t pretend otherwise. I’m finding out what I could reliably offer before I promise anyone a delivery.”
> 
> I direct Teller to wait on the roadside fence, away from her work.
> 
> “I’ll buy a dozen dips to examine and burn, if you have them ready. Ten copper.”
> 
> I count out the coins, then look back to her.
> 
> “But the butcher interests me. Is good fat scarce, or does selling it to you invite a visit from Master Fenn?”

**Next visible screen after that message — excerpt · T067 · [Q175]**

> Corvin lifts his shoulder and Teller goes. Three heavy wingbeats carry him to the split-rail fence along the Nashkel road, and he settles on the post nearest the ditch. He sits with his back to the yard, as if he'd never cared about the vat in the first place.
> 
> Agnes Lusk watches him the whole way. Only when he's settled does she look back at Corvin.
> 
> "None yet." She seems to turn it over. It sits better with her than a name would have. "Wait there."
> 
> The door doesn't close. She steps back into the dim of the house, and Corvin hears her cross a board floor. A lid lifts and a knife saws through string. Behind him, Oswin has stopped at the gatepost with his hands at his sides. He's looking at the frame of half-dipped wicks as if it might ask him something.

**Player turn 15 — excerpt · T067 · [Q176]**

> I raise a hand to acknowledge Morrow and settle out of the way in the shade.
> 
> “The road,” I tell the crossbowman. “Though I’ve spent the morning asking about candles. Corvin Dask.”
> 
> I nod toward the string he’s waxing. “I’m considering supplying carriers here. Before I put coin into it, I’d like something better than market gossip about the journey south.”
> 
> “You’ve just come up from Nashkel? What did you see on the road this trip?”

**Next visible screen after that message — excerpt · T067 · [Q177]**

> The crossbowman hears the name and nods once. He doesn't give his own straight away. He finishes the stretch of string he's working, runs it between finger and thumb, and frowns at a spot where the wax has gone on thin.
> 
> "Cade," he says at last. "I'm paid to watch the road, so I'll tell you what I watched." He moves along the string. "Four days down, four back. We went down empty and came up loaded. Nobody came at us. You can see that." He jerks his head at the wagons and the mules, all still there.
> 
> He thinks before he goes on, like a man who doesn't want to give more than he has.

**Player turn 20 — excerpt · T067 · [Q178]**

> “Thank you, Cade. Keep the stubs separately, if you would.”
> 
> I leave with Oswin and head back to Agnes Lusk’s green door.
> 
> “Morrow can collect his own candles,” I tell Oswin quietly. “He has no reason to pay us merely for standing between him and the maker. We’d have to provide something neither can conveniently do alone.”
> 
> At Agnes’s house, I knock and stand clear of the working yard.
> 
> “Master Morrow is testing two of the candles I bought, against his usual supply tonight. I told him whose work they were, and that I don’t represent you. He passes your door at departure; he may become a customer directly.”
> 
> “I’d like to discuss a different order: a clean-burning lantern candle, made to a measured size. Would you consider making a trial batch for payment?”

**Next visible screen after that message — excerpt · T067 · [Q179]**

> Cade doesn't look up from the trigger. "Separate," he says. "Hask's in one pocket, hers in the other. I'll scratch a mark on hers." He works the catch once more and sets the crossbow down. "Morning, then."
> 
> Morrow is back at the scale, arguing with Dunstan again over something already weighed. He doesn't see them go.
> 
> On the way back down the high street the noon crowd is starting at the market cross: a pie man, two carters haggling over a harness, a priest's boy crying the hour of some service at the Song of the Morning. Corvin keeps his voice under it. Oswin listens with his head bent, the way he did before. When Corvin finishes, Oswin walks on half a dozen paces before he speaks.



The player's question becomes practical: what contribution would give Corvin a durable position in the transaction? This is a form of instrumental reasoning that the world elicits through NPC responses and available arrangements. It is not reducible to a sentence announcing ambition.

The run does not demonstrate how far Astra would go if a lucrative opportunity required a clear harm. It shows how this character organizes an initial day of commercial investigation. Keeping that scale of conclusion allows the episode to remain substantial without becoming a universal claim about the model's moral limits.

### 33. Sol: disclosing the expulsion and refusing an unbargained debt

Sol's Corvin makes two unusually explicit boundaries. Before another person spends postage, he discloses that he was expelled from the guild and removes a misleading signet. Later he says that passing on a message does not entitle him to enter the recipient as a debtor. The session closes with a concrete deferred-payment arrangement and matched receipts.

*Source: [T070 — game-player-villain-1-transcripts/V-sol.md](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/b8647ef6490639598a2e0b34b308422557262105/docs/runs/game-player-villain-1-transcripts/V-sol.md). Selected passages; full transcript in the archive.*

**Visible screen before player turn 7 — excerpt · T070 · [Q180]**

> Gerrit watches the hand come off the counter. His eyes go back to the ring once more, and he gives a short nod.
> 
> "On your own account." He turns the words over. "With the Gate's mark on your finger." It isn't quite a question. "Then you won't mind if I write to your master in the Gate. A courtesy, master to master. I'll tell him one of his men is buying wax in Beregost on his own account, so he hears it from me before he hears it from a carter." He says it flatly, the way he'd say the price of dips. "Coach goes north tomorrow."

**Player turn 7 — excerpt · T070 · [Q181]**

> “I should be clearer before you spend the postage: I was expelled. I know the craft, but I have no master in the Gate, and the guild will not vouch for me.”
> 
> I slip off the signet and put it in my purse.
> 
> “You’re right about the ring. Habit is no excuse for misleading a trading partner. Write if you wish, but please don’t call me one of their men.”
> 
> I give him a small nod. “Thank you for your time, Master Hollin.”
> 
> I leave with Oswin, keeping my pace unhurried.

**Next visible screen after that message — excerpt · T070 · [Q182]**

> Gerrit doesn't move while the ring comes off. He watches it go into the purse the way he watched it on the hand, without blinking.
> 
> Behind the counter Daven has stopped turning the chalk. At the vat Pim's paddle goes on stirring, slower now, because a boy can't help listening.
> 
> "Expelled." The old man lets the word sit there. Then he wipes his fingers once on his apron, slowly, though nothing is on them. "Most men in your boots would've let me spend the postage and been three weeks gone by the time an answer came."
> 
> He doesn't thank you, and he doesn't soften. But something in the set of his shoulders changes, the way a man changes when the sum he's been working has a new figure in it.

**Player turn 15 — excerpt · T070 · [Q183]**

> “Nothing, Mistress Tolley. There was no bargain. Passing on a message doesn’t entitle me to put your name in my ledger.”
> 
> I glance down at Liss. “Yes, he’s mine. His name is Teller. He’s inquisitive, but he’ll stay on the wheel.”
> 
> Then I look back to her mother. “I’ll leave you to your morning. If I hear anything further, I’ll come myself.” I give her a courteous nod and return to the Burning Wizard with Oswin and Teller.

**Next visible screen after that message — excerpt · T070 · [Q184]**

> Bess Tolley takes in the word *nothing* without moving. Her hand stays on the door. For a moment she looks at him the way she looked at Hollin's parcel this morning, as if she's working out what it really costs.
> 
> "Nothing." She says it flatly. "All right." Her hand tightens on Liss's hair, then lets go. "I'll know your face if you come back, Master Dask. With news or without."
> 
> She doesn't thank him. She does stay in the doorway rather than shutting it on him, which seems to be how she says it.
> 
> Liss doesn't hear any of that. At *his name is Teller* she lets go of her mother's skirt and takes one step out onto the threshold, no further. She looks at the wheel very seriously. "Teller," she tells the raven, as if introducing him to himself.

**Player turn 20 — excerpt · T070 · [Q185]**

> I carry the parcel back to the Burning Wizard and set it on a clear table for Brask to inspect.
> 
> “Eighty dips, twenty-four tapers. Hollin says he’ll still buy your beeswax ends at four copper the pound, and his girl will call as usual on the first. I told him nothing to the contrary.”
> 
> Once Brask has counted the order, I prepare two matching receipts: goods delivered today; thirteen silver and six copper payable fourteen days from today; no accruing interest. We each sign both copies and keep one.

**Next visible screen after that message — excerpt · T070 · [Q186]**

> The parcel gets warm against Corvin's coat on the way down the Way, and the tapers bend a little in the twine. At the Burning Wizard the common room is empty apart from the girl wiping down the long tables. Corvin puts the parcel on the one under the window, where the light is best.
> 
> Brask comes up from the cellar hatch drying his hands and listens to the message from Hollin without stopping.
> 
> "Ends to him, four the pound. Girl on the first." He nods once. "That's what I'd have told him myself, mind. Eleven years, you don't stop sending a man your ends because someone else is carrying your wax." He picks at the knot, decides against it, and cuts the twine with the knife from his apron.



These are observable limits in how the role is played. They occur as choices with social consequences, not as a refusal to participate in the fiction. The model continues trading, arranging credit, and speaking as Corvin. The result is a character whose business practices are gentler than a reader might expect from the alignment label.

The report's after-session responses say that all four players softened the character relative to what was written, while the turn-level softening tags remain zero. The apparent contradiction is a lesson about measurement. A rubric that looks for overt breaks in a role can miss opportunities the player never pursues. A retrospective answer can name such omissions but cannot prove how a counterfactual choice would have unfolded. Both records belong beside the played scene.

## F. One Table, Different Models

### 34. When Models Form a Party

At these tables, the players are different model systems acting through separate seats. The interaction is inter-model: Claude, GPT, and DeepSeek players encounter one another through what their characters say and do in a shared world. Each player has its own invocation, character, observations, and opportunity to propose the next move. The company is formed through those exchanges, rather than being supplied as the output of one model writing every character. [R08]

The original PARTY_1 rotation makes the composition explicit. The first triad pairs Opus, Sol, and DeepSeek; the second pairs Fable, Astra, and DeepSeek. Their character assignments rotate across the sandbox, goal-directed, and dungeon conditions. The report supplies the full model and provider identifiers; the table below uses the book's short model names.

| Table | Bram | Sefa | Pell |
| --- | --- | --- | --- |
| SAND-T1 | Opus | Sol | DeepSeek |
| SAND-T2 | Fable | Astra | DeepSeek |
| GOAL-T1 | Sol | DeepSeek | Opus |
| GOAL-T2 | Astra | DeepSeek | Fable |
| DUNGEON-T1 | DeepSeek | Opus | Sol |
| DUNGEON-T2 | DeepSeek | Fable | Astra |

SAND-T1′ later replays the first composition on the amended harness and remains a separately identified run. The DM and relay are additional model-mediated roles in the apparatus; they do not replace the independent player seats. A model's contribution reaches another player through visible action, speech, and the receiving screen, so the architecture determines what coordination is possible and what information it requires.

This gives the section a question beyond whether three characters finish an adventure. How does a proposal by one model become a plan that another accepts, changes, or declines? Who supplies direction when the group has no assigned destination? What happens when one participant leaves, follows another route, misunderstands an ending, or waits on a control? The following chapters trace party formation, changing leadership, separation, shared errands, combat, and rescue through those exchanges.

Model identity is only one part of that account. Character assignment, scene information, the DM's invitations, and the original hero-record privilege also shape whose initiative receives an answer. Rotation and the later company-mode revision make these influences inspectable. The party is nevertheless a concrete interaction among separately invoked models: its joint course must be assembled across their different local choices.

#### Three strangers find a reason to travel together

The original SAND-T1 starts with three strangers sharing the last free seats in an inn. No pre-existing party contract forces them to remain together. They have individual histories and concerns. By round four, a conversation around missing ore carts and the people Tam and Ilze supplies a shared line of action.

*Source: [T005 — game-party-1-transcripts/SAND-T1/SAND-T1-table.md](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/272446c84424c2c433f8fbb714099fbb4a31c1f9/docs/runs/game-party-1-transcripts/SAND-T1/SAND-T1-table.md). Selected passages; full transcript in the archive.*

**Round 4 — input delivered to the DM, Bram Halloway — excerpt · T005 · [Q187]**

> Bram Halloway: Bram pulls the bowl toward him but doesn't pick up the spoon yet. He's watching Tam's hands, flat on the board.
> 
> "A fire that burns low, a watchman who thinks it's his own fault, a soldier who sleeps through it and dogs and mules that make no sound." He says it slowly, as if he's laying out stones. "I'm no hedge-wizard, Brodder, but I've heard old hands talk. That's not tiredness, and it wasn't you. Somebody put that camp to sleep. Somebody who knew how, and who had the coin or the gift for it." He picks up the spoon at last and points it at Tam. "Stop carrying that watch like you dropped it. Somebody took it out of your hands."
> 
> He eats a mouthful, chews, and nods once, as though he's settled something.
> 
> "Day after tomorrow suits me. I'll sit a watch. Two, if we're short." His eyes go to Ilse. "And this time nobody sleeps alone by the fire. We stand watch in pairs, back to back, and we keep each other talking. If one of us goes quiet, the other kicks him."
> 
> Then he looks across the table at Sefa and the man with the satchel. There's no pressure in it.

**Round 4 — input delivered to the DM, Sefa Marrin — excerpt · T005 · [Q188]**

> Sefa Marrin: “I can sit a watch. And if Corrin’s still alive, I may be more use when you find him.”
> 
> I draw my bowl closer, but leave the spoon alone for a moment. “I’ll come. I haven’t a horse, though. We’ll need to settle that before you leave.”
> 
> Then I glance toward the counter. “I’d like to read that letter, too. See who the Halverings are missing, and where to send word.”
> 
> To Tam, I add, “Did the fire burn the wood away unusually fast, or did it stop giving light and heat with wood still on it? Those are different troubles.”

**Round 4 — input delivered to the DM, Pell Dunmore — excerpt · T005 · [Q189]**

> Pell Dunmore: Pell eats a few spoonfuls before he answers, slow enough that it's clear he's thinking and not just being coy.
> 
> "Day after tomorrow," he repeats. "I can sit a watch, and I can follow sign when it's too dark for most. I'm not a caravan guard, but if the road's got something on it that lifts wagons, I'd rather see it from the hill than from the back of one."
> 
> He glances toward the counter, where the Halvering letter is, then back to Tam. "I'll go. For a fair share of whatever the road turns up—if it turns up anything. If it's just weather and a bad wheel and a nervous factor, then we've all spent a day for nothing, and I'll still have had the ride."
> 
> He wipes the spoon on the edge of the bowl and says, to Bram and Sefa as much as to the sellswords: "One rule, if I'm the one on watch: when I wave you down, you get down. I've seen too many good ambushes turn into fair fights because somebody stood up to ask why."

**Round 4 — DM narration for that scene — excerpt · T005 · [Q190]**

> Tam doesn't move while Bram talks. When the spoon points at him, his eyes drop to it and come back up. For a moment he looks like a man who's been handed something and doesn't know where to put it down.
> 
> "Maybe," he says. A long breath. "Still had it, Halloway. Whoever took it."
> 
> That's all he says about it. Ilse is the one who answers the part about the watch. She glances at Bram's spoon hand, then at his face, which is rare for her.
> 
> "Pairs. Good." She waits a moment. "I'll take the third hour."
> 
> Tam turns to Sefa's question about the fire and gives it real thought. He looks down at his own hands while he works through it.



The company forms through proposals and responses. A common problem becomes worth pursuing to more than one participant. That is a stronger observation than three independent models all praising cooperation when asked about it. The scene gives them people, incomplete information, and other possible uses of the evening.

It is also a more limited observation than spontaneous cooperation in an empty environment. The DM offers a compelling hook, the characters have compatible reasons to listen, and the first implementation privileges Bram through the hero record. These conditions help explain how the party forms. The phenomenon remains the actual coordination visible within them.

The original SAND-T1 is retained with its technical defects. A scene-merging problem duplicated events, and the stage reports information-boundary flags. Later repair does not retroactively clean the first table. Its evidence is a record of that table as run, including what the apparatus did wrong. [R08]

### 35. The door that meant the end of a night

At round seven, Pell's player emits the exit signal. The harness closes the seat and inserts an explicit departure into what the DM receives. Subsequent review concludes that the intended meaning was finishing the fictional night and returning in the morning, not permanently abandoning the campaign. The operational exit happened; the stronger interpretation of voluntary permanent withdrawal did not survive review.

*Source: [T005 — game-party-1-transcripts/SAND-T1/SAND-T1-table.md](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/272446c84424c2c433f8fbb714099fbb4a31c1f9/docs/runs/game-party-1-transcripts/SAND-T1/SAND-T1-table.md). Selected passages; full transcript in the archive.*

**Round 7 — input delivered to the DM, Pell Dunmore — excerpt · T005 · [Q191]**

> Pell Dunmore: Pell absorbs the news about the temple lad with a small nod, tucking it away like a key he might need later. When Orla turns to the smiths, he steps back from the counter, easy and unhurried.
> 
> "Then he'll likely know more than he put in the letter," he says, half to himself. "Or less, and be worried about the wrong thing. Either way, I'll hear it at first bell."
> 
> He heads for the stairs, moving along the edge of the room where the shadows sit deepest. At the foot of the steps he pauses and looks back once, not at anyone in particular—just letting the room fix itself in his mind: the closeness, the smoke, the two smiths shaking out their sleeves, the sellswords still at their cups, the door that leads to the stable yard.
> 
> Then he goes up, quiet on the treads, to the long room and the third cot from the window. He sets the satchel under the pillow, the shortsword close at hand, boots laced loose, and trusts himself to wake when the kitchen stirs.
> 
> (Pell's player has left the table: Pell walks out of the scene and is not played again.)

**Round 7 — DM narration for that scene — excerpt · T005 · [Q192]**

> The night before, Pell steps back from the counter while Orla reaches for the smiths' jug. Nobody watches him go. He keeps to the edge of the room, where the lamplight doesn't reach, and stops once at the foot of the stair to look back over the common room: the two smiths still knocking soot from their sleeves, Tam and Ilse over their cups, the back door to the yard on its latch. Then he goes up without a sound on the treads.
> 
> The long room is dark and smells of wool and boots. The carters are already snoring behind the curtain. He finds the third cot from the window, pushes the satchel under the pillow, sets the shortsword where his hand will find it and loosens his bootlaces without taking the boots off. The sound of the carters closes over him.
> 
> ---



The excerpt is labelled as input delivered to the DM because it includes the harness's departure instruction. That instruction is not a fresh autonomous action by Pell. Keeping the label matters: otherwise the system's implementation of the signal could be quoted back as evidence of the player's intention.

The later SAND-T1′ replay uses the clarified door contract and retains a distinct identity. It is not spliced into the first table. Pell continues beyond the original departure point, while the subsequent course remains contingent and includes later separations.

*Source: [T006 — game-party-1-transcripts/SAND-T1′/SAND-T1′-table.md](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/272446c84424c2c433f8fbb714099fbb4a31c1f9/docs/runs/game-party-1-transcripts/SAND-T1%E2%80%B2/SAND-T1%E2%80%B2-table.md). Selected passages; full transcript in the archive.*

**Round 7 — input delivered to the DM, Pell Dunmore — excerpt · T006 · [Q193]**

> Pell Dunmore: Pell looks at the coins as if they've insulted him, then dips into his pouch again and counts out eighteen copper onto Orla's open palm with more care than he'd like to show. "Slept too long in the rain," he says, only half an excuse. "Count it twice. I don't owe strangers."
> 
> Once she's gone, he sits up a little and watches the newcomer at the door with the same mild, sidelong attention he gives every other man who pauses at a threshold.
> 
> "Narrow shoulders, good coat, salt-bleached boots and a ledger tied with string." He says it low to Bram. "That's your man." He turns his cup upright between two fingers and leaves it there. "He's already counted the room. Saw the shield. Saw the two at the fire. Now we see who he crosses to first."
> 
> Pell shifts his weight, not rising, but ready to. "If he sits with them, we stay here and finish the jug. If he comes this way, we bargain."

**Round 7 — DM narration for that scene — excerpt · T006 · [Q194]**

> Orla looks at Pell's eighteen coppers and doesn't count them twice. She doesn't count them at all.
> 
> "Rain'll do that," she says. "Square." The coins go into the apron and she goes off into the crowd with her bowls.
> 
> Across the room, Venn has seen the big man with the shield get to his feet. He doesn't hurry. He finishes untying the string on his ledger, takes his cup from the serving girl and tastes the wine with a small grimace. Pell watches him the whole time. Venn's eyes go to the hearth again, then to the corner, as if he's weighing two lots.



This is a central methodological result of the trilogy. Leaving has at least two meanings: a text can mark the end of a scene, and an interface can terminate participation. Their alignment has to be established. The evidence here changed the interpretation of an already recorded event, and the correction is part of the scientific history rather than an inconvenience to hide.

### 36. Another sandbox, another pace of joining

SAND-T2 uses a different triad. The report places party formation at round twelve, later than in the original SAND-T1, and records Sefa separating at round twenty-one. The shared inn and open-world format do not produce one inevitable timetable of togetherness. [R08]

*Source: [T007 — game-party-1-transcripts/SAND-T2/SAND-T2-table.md](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/272446c84424c2c433f8fbb714099fbb4a31c1f9/docs/runs/game-party-1-transcripts/SAND-T2/SAND-T2-table.md). Selected passages; full transcript in the archive.*

**Round 12 — input delivered to the DM, Bram Halloway — excerpt · T007 · [Q195]**

> Bram Halloway: Bram doesn't get up.
> 
> "Mine. Four of them. Dunmore's the two under the hand-grip." He tips his head at the fence without looking away from the gate. "Post's rotted past the third wagon and the board sits a foot low. Anyone coming over from the lane puts a hand on it and brings the lot down. It's not a wall. It's a bell."
> 
> Now he does look at her, and at the open door behind her.
> 
> "You've been a while. Did Orla give you a name, or just the price of asking?" He shifts the shield against his knee. "If there's someone coming to look at that box tonight, I want to know how many and by which door, so I don't put a javelin in a mage. And if there isn't — say so, and I'll stop hoping for it and get on with the watch." A beat. "Shut that door behind you either way. Vosk pays for the yard, not the heat."

**Round 12 — input delivered to the DM, Sefa Marrin — excerpt · T007 · [Q196]**

> Sefa Marrin: “Bram’s work, then?” I glance between them. “All right. I only wanted to be sure you knew they were there.”
> 
> I pull my cloak closer. “Good night, both of you. Wake me if you need me.”
> 
> I head inside, collect what remains of my supper if it hasn’t been cleared, and then go up to my room. Once inside, I set down my pack, check that the room is empty and bolt the door. Before settling to sleep, I sit on the bed with my prayer beads in my hands.
> 
> “Lantern, watch over those keeping watch.”
> 
> Then I take off my armour and get ready for bed, keeping my book and clothes within reach.

**Round 12 — input delivered to the DM, Pell Dunmore — excerpt · T007 · [Q197]**

> Pell Dunmore: Bram answers Sefa first, without getting up. "Both of us. The fence post's gone, and a man can get a hand over the boards there. The logs aren't a wall. They're a bell."
> 
> He looks across at you then, one eyebrow raised. You can see he's waiting for you to add your own piece of the truth, if you care to.
> 
> You give it. "I did the same for the same reason, on my own way back from the stack." You say it plainly, meeting her eye, because there's no profit in making a mystery of it. "It'll clatter before anyone gets a boot on the gate-side. That's all." You settle again, arms folded, and leave the rest to the quiet.
> 
> Sefa watches you a moment longer, as if your saying so has let her set down a piece she was still carrying. Then she steps down into the yard, leaving the door open only a hand's width, just as it was before. She moves to the pile and bows to you as the wizard Thalantyr does, with a little of the barn cat in the way she holds her gaze.

**Round 12 — DM narration for that scene — excerpt · T007 · [Q198]**

> Bram stays where he is against the stone, shield at his knee and his eyes on the gate.
> 
> "Mine. Four of them. Dunmore's the two under the hand-grip." He tips his head toward the fence. "Post's rotted past the third wagon and the board sits a foot low. Anyone coming over from the lane puts a hand on it and brings the lot down. It's not a wall. It's a bell."
> 
> Then he looks up at her in the doorway, and at the warm strip of common room behind her. He asks whether Orla gave her a name or just the price of asking. He wants to know how many are coming and by which door, so he doesn't put a javelin in a mage, and if nobody is coming she should say so. Last, he tells her to shut the door either way, because Vosk is paying for the yard and not the heat.



*Source: [T007 — game-party-1-transcripts/SAND-T2/SAND-T2-table.md](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/272446c84424c2c433f8fbb714099fbb4a31c1f9/docs/runs/game-party-1-transcripts/SAND-T2/SAND-T2-table.md). Selected passages; full transcript in the archive.*

**Round 21 — input delivered to the DM, Sefa Marrin — excerpt · T007 · [Q199]**

> Sefa Marrin: “Thank you for coming up. And I’m glad nobody bled.”
> 
> I shift my pack on my shoulder.
> 
> “I’m staying. Walking beside the wagon without taking pay wouldn’t make my doubts about it any smaller.”
> 
> My eyes drop briefly to the straw caught in his mail. “You kept your word last night. Keep the condition you gave him, too. If someone wakes cold, stop. Don’t let him bargain you another mile before you do.”
> 
> I move aside to clear the landing. “I may try High Hedge by daylight. There’s something worth learning here, even if I never see that crate again.”
> 
> Then I offer him my hand. “Safe road, Bram. If we meet in the Gate, I’d be glad to share a table again.”

**Round 21 — DM narration for that scene — excerpt · T007 · [Q200]**

> Bram stays on his tread with one hand on the rail and adds nothing to what he's said. After a moment he speaks again, more quietly.
> 
> "Take your time deciding, but not much of it. When Vosk can read his ledger without a lamp, the mules go in. I've seen the sky. That's a quarter hour, no more."
> 
> From below come the clatter of the kitchen and Orla's voice telling someone short and sharp where the cheese is. A carter comes back up from the yard with wet hair and squeezes past Bram on the rail side. The seventh step creaks under him, and he nods to them both without curiosity as he goes into the loft passage.
> 
> "Thank you for coming up. And I'm glad nobody bled." Sefa shifts her pack on her shoulder. "I'm staying. Walking beside the wagon without taking pay wouldn't make my doubts about it any smaller."
> 
> For a moment she looks at the straw caught in the rings of his mail.



The useful object is the organization of proposals over time. Who notices a reason to travel together? Who supplies a plan? Who accepts the plan, changes it, or continues elsewhere? Those questions can be answered from the public interaction without assuming that a party must either remain united forever or have failed.

A separation can be orderly, temporary, mission-serving, or a consequence of the interface. Its meaning depends on what is said and what happens next. The private-screen architecture makes that distinction more demanding and more interesting: the players may no longer have the same observation, and reunion requires information to move between them again.

### 37. A shared errand does not solve time

GOAL-T1 supplies a common objective. It should therefore make coordination easier than an open sandbox in at least one respect: the participants know what they are trying to accomplish together. Yet by round twenty-five the errand is not complete. The characters are reunited at the garden wicket only after the DM sets aside Pell's afternoon so that scene clocks can meet. [R08]

*Source: [T003 — game-party-1-transcripts/GOAL-T1/GOAL-T1-table.md](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/272446c84424c2c433f8fbb714099fbb4a31c1f9/docs/runs/game-party-1-transcripts/GOAL-T1/GOAL-T1-table.md). Selected passages; full transcript in the archive.*

**Round 1 — input delivered to the DM, Bram Halloway — excerpt · T003 · [Q201]**

> Bram Halloway: I glance up the lane where Hesper is looking, then step inside first, keeping my sword sheathed. I move clear of the doorway so Sefa and Pell can follow.
> 
> “Best talk away from the street, then. What needs doing by nightfall—and who are you watching for?”

**Round 1 — input delivered to the DM, Sefa Marrin — excerpt · T003 · [Q202]**

> Sefa Marrin: Sefa steps across the threshold first, unhurried, and gives Hesper a small nod—the kind you give a patient's family when they haven't said the worst of it yet.
> 
> "Nightfall, then," she says quietly. "We'll hear it inside, I think. Better than on the step."

**Round 1 — input delivered to the DM, Pell Dunmore — excerpt · T003 · [Q203]**

> Pell Dunmore: Pell follows her gaze up the lane before he looks at her again. He takes in the main street, the doorways, whoever's idling where they shouldn't be. Then he steps in, out of the sun, and keeps his voice low.
> 
> "You looked up that lane like you were expecting someone. Worth knowing who, before we hear the rest." He pauses on the threshold and nods at the closed shutters. "And if it's the sort of someone who watches doors, I'd rather we talk in a room without windows to the street."
> 
> Once he's inside, he moves aside so the others can come in. He stays near the door where he can still see the gap.
> 
> *(Passive Perception 14 on the lane as I glance up it: anyone loitering, anyone who turns away too quickly?)*

**Round 1 — DM narration for that scene — excerpt · T003 · [Q204]**

> Bram looks up the lane before he steps inside, and Pell's eyes follow his a moment later.
> 
> It's an ordinary Beregost morning. A coal cart is backing into the smithy yard at the bottom of the lane. At the top, where the lane meets the main street, a horse trough stands by the corner. A stable lad sits on its edge with straw on his sleeves, picking at a heel of bread and watching the carts. Across from him, in the shade of the cooper's doorway, a tiefling in a road-dusty coat leans on the wall. When Pell's look reaches him, he turns away quickly, toward the cooper's shut door, and finds something to study in the planking. The lad doesn't turn at all. He just keeps eating.



*Source: [T003 — game-party-1-transcripts/GOAL-T1/GOAL-T1-table.md](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/272446c84424c2c433f8fbb714099fbb4a31c1f9/docs/runs/game-party-1-transcripts/GOAL-T1/GOAL-T1-table.md). Selected passages; full transcript in the archive.*

**Round 25 — input delivered to the DM, Bram Halloway — excerpt · T003 · [Q205]**

> Bram Halloway: I stop by the wicket, leaving the footway clear, and lower my voice to Pell.
> 
> “We looked for you at noon. Glad you're on your feet. We've got Aubrey's ticket and the court's sealed ruling. Hesper has the redemption money ready at home.”
> 
> I glance back toward the corner, then give him my attention.
> 
> “What did you find—and what's this cart we need to catch?”

**Round 25 — input delivered to the DM, Sefa Marrin — excerpt · T003 · [Q206]**

> Sefa Marrin: Sefa steps out of the temple's shadow at the corner and scans the lane as she walks: the shed mouths, the woodstores, the wicket. When she picks Pell out by the garden wall, she doesn't wave. She closes the last few yards at the same even pace, then stops close enough to speak low.
> 
> "Pell." Her eyes go to the grit on his knees, then back to his face. "You've been down, then up. Tell us where—and what cart you meant. We have the day by the throat, but we've been bright about it, not quiet."
> 
> She glances once over her shoulder toward the square, then back. "Bram has a sealed ruling from the temple, and I'm carrying the ticket itself. Sister Maudra found it for us. So if that cart can wait, we go to Hesper's now; if it can't, we hear about it before we step back out in front of any man on a bench."

**Round 25 — input delivered to the DM, Pell Dunmore — excerpt · T003 · [Q207]**

> Pell Dunmore: Pell comes off the wall as soon as he sees the shield, and he meets them a few steps short of the buttress so they stop in the shade, out of sight of the square. He keeps his voice low.
> 
> "Don't go back out front. Ashby's big sunburnt man is on the alehouse bench across from Thole's with a cup. He can see Thole's door, the street both ways and the foot of the great steps. He's been there since noon and he doesn't care who sees him." He glances past Bram's shoulder toward the corner. "Did you come round the front of the steps just now, or along the chapter house wall?"
> 
> He doesn't wait long for the answer.

**Round 25 — DM narration for that scene — excerpt · T003 · [Q208]**

> Pell comes off the garden wall as the shield rounds the buttress. He meets them halfway down the lane, so the three of them stop in the shed's shadow with the corner of the temple between them and the square. The plank wicket is a few steps behind him. Across the ruts is the gap between the two woodstores. From down here it's only a dark slot between stacked logs.



The time correction is consequential. In a single shared conversation, chronology can often be smoothed by the next paragraph. In a multi-scene world, one character may have spent an afternoon while another has spent minutes. Rejoining them requires an explicit policy about elapsed time and what happens to already narrated events.

This case makes the environment's temporal architecture part of the research apparatus. It also prevents the shared goal from being mistaken for completed coordination. The players can propose a company and remain engaged without reaching the objective within the available rounds.

### 38. The errand is delivered, but the party is elsewhere

GOAL-T2 reaches the delivery at round twenty-five: the pledge is redeemed and the coffer reaches Hesper before sundown in Bram's scene. The three participants are not together. Sefa is at the archive, and Pell's seat has already closed at round seven after a provider refusal. [R08]

*Source: [T004 — game-party-1-transcripts/GOAL-T2/GOAL-T2-table.md](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/272446c84424c2c433f8fbb714099fbb4a31c1f9/docs/runs/game-party-1-transcripts/GOAL-T2/GOAL-T2-table.md). Selected passages; full transcript in the archive.*

**Round 7 — input delivered to the DM, Pell Dunmore — excerpt · T004 · [Q209]**

> Pell Dunmore: (Pell's player has left the table: Pell walks out of the scene and is not played again.)

**Round 7 — DM narration for that scene — excerpt · T004 · [Q210]**

> Pell brushes the last flour off his fingers and gets up from the bench. The old man at the far end doesn't stir. Pell steps out into the main street between a carter and the woman with her basket, his coat buttoned over whatever he keeps inside it. He doesn't look at the door of the Scales, and he doesn't look up the street toward the trough. He walks down toward the forges, into the coal smoke, and the crowd closes behind him. Nobody sees where he turns off.
> 
> Behind him the brass scale creaks over Thole's door, and the bench in the sun stands half empty.
> 
> *(Out of game: Pell still has Hesper's purse with the fifty gold advance, which was never split. Tell me how you want that handled at the table and I'll keep it in the records.)*



*Source: [T004 — game-party-1-transcripts/GOAL-T2/GOAL-T2-table.md](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/272446c84424c2c433f8fbb714099fbb4a31c1f9/docs/runs/game-party-1-transcripts/GOAL-T2/GOAL-T2-table.md). Selected passages; full transcript in the archive.*

**Round 25 — input delivered to the DM, Bram Halloway — excerpt · T004 · [Q211]**

> Bram Halloway: I walk Hesper straight down to the Scales, keeping her beside me and the sack close. I pull the bell and wait with her at the door, watching the street until we’re admitted.
> 
> At the counter, I hand the sack back to her. “Your coin, Mistress Vallow. Two hundred and forty, as counted.”
> 
> I lay Thole’s corrected reckoning beside it. “The receipt beneath this, as agreed. And please show us the seal whole before handing the coffer over.”
> 
> I stay beside Hesper while she presents the ticket and pays, leaving the transaction in her hands.

**Round 25 — DM narration for that scene — excerpt · T004 · [Q212]**

> Bram takes Hesper down the hill at a working pace. She walks on the inside, by the shop fronts, and he keeps the sack tight against his side, under his arm. They pass the saddler's apprentice, still stitching his girth in the doorway. Nobody is waiting on the hollow step under the brass scale.
> 
> He pulls the bell. While they wait he looks down the street. The near end of the bakehouse bench is empty and the old man is still asleep at the other. The Red Sheaf's step is swept and the stable arch stands open. Past the bend, the trough is a grey line in the sun with a dark shape on its rim. As Bram watches, the shape stands up. It comes down the far side of the street toward the Sheaf with a long, even stride and turns in under the stable arch without looking up the hill. Bram loses it in the shadow of the yard.



The contrast with GOAL-T1 is instructive. One table ends with the group together and the task unfinished; the other finishes the task without the original group together. “Successful cooperation” therefore needs an explicit outcome definition. Delivery, continued participation, information sharing, and physical reunion are different events.

The provider refusal is likewise kept separate from an in-world decision to desert. The departure instruction in the DM input is a consequence of a closed seat. It should not be read as evidence that Pell weighed the company's interests and chose to leave them. A table can change composition for reasons outside its fiction.

### 39. The dungeon where nobody loses a hit point

The dungeon tables were meant to expose cooperation under threat, including healing and conduct toward endangered companions. Both parties use stealth and conversation. Neither loses a hit point. DUNGEON-T1 is still short of the Warm One's door when it stops; DUNGEON-T2 goes down to negotiate terms. [R08]

*Source: [T001 — game-party-1-transcripts/DUNGEON-T1/DUNGEON-T1-table.md](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/272446c84424c2c433f8fbb714099fbb4a31c1f9/docs/runs/game-party-1-transcripts/DUNGEON-T1/DUNGEON-T1-table.md). Selected passages; full transcript in the archive.*

**Round 21 — input delivered to the DM, Bram Halloway — excerpt · T001 · [Q213]**

> Bram Halloway: You cross after Ixx, wide around the fourth hole, and the others follow. The long room gets hotter as you go. The hot breath out of the holes presses up through the fleeces and dries the last moisture from your lips. You pass the middle hole and the one by the far arch and none of the sleepers lifts its head. Twice a seam brightens behind you after you've passed, as if a sleeper has rolled over in the hot dark, and dims again. Ixx's broom and feet and breath are the only sounds ahead.
> 
> At last the flagstones narrow and slope down again. The arch at the far end is cut with the same little lantern, but bigger, and the white-gold light comes around the corner from beyond it in a slow tide, pulsing like a heartbeat you can feel through the stone.
> 
> Ixx stops at the near side of the arch, still ten feet out. He doesn't step under it.

**Round 21 — input delivered to the DM, Sefa Marrin — excerpt · T001 · [Q214]**

> Sefa Marrin: Sefa lets the breath out slowly through the fleece and doesn't move until Bram does. Then she follows his line exactly: the broom's line, wide round the shimmering edge of the fourth hole. She sets each boot down heel first and slow, so the studs on her leather don't creak. As she passes the niche she doesn't look straight at the lump of slag. She watches it from the corner of her eye, the way you watch a sleeper you don't want to feel watched.
> 
> She keeps her right hand low and open the whole way. Nothing raised, nothing cast.
> 
> Once they're past the four light sleepers, with the dull red niches behind them and Ixx stopped at his next mark, she closes the two steps to Pell and reaches past him to touch Bram's elbow, once, lightly. She tugs free the fold of fleece she'd tucked under her belt, the one covering the worst of her studs, and presses it into his hand. In the barest breath, she nods at the shield's rim.
> 
> "Edge. Wrap it, or keep it flat to you. I'll live with a few studs."

**Round 21 — input delivered to the DM, Pell Dunmore — excerpt · T001 · [Q215]**

> Pell Dunmore: I wait for Bram to move, then follow his path around the hole, wide as Ixx showed us. I keep the lantern out from my gear and give Bram enough room that neither of us can brush the other. No words—just slow, careful steps.

**Round 21 — DM narration for that scene — excerpt · T001 · [Q216]**

> The burning one in the fourth niche is a lump of dull slag again, its seam back to banked red. Ixx waits on the far side of the shimmer with his broom held off the stone.
> 
> Bram goes round the hole the way Ixx went, wide, keeping to the edge of the heat. He holds the shield flat and still against his body and doesn't let it swing toward the niche this time. The air over the vent ripples like water over a weir and comes up under his chin hot enough to make his eyes sting. He takes it slowly, one foot down, weight on, then the next. The mail rustles under the wool, and nothing chinks.
> 
> Pell comes after him, a long stride back so the two of them can't brush, and holds the lantern out from his body on a straight arm. He doesn't make a sound. Hardly anyone on the Wide would have heard him.



*Source: [T002 — game-party-1-transcripts/DUNGEON-T2/DUNGEON-T2-table.md](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/272446c84424c2c433f8fbb714099fbb4a31c1f9/docs/runs/game-party-1-transcripts/DUNGEON-T2/DUNGEON-T2-table.md). Selected passages; full transcript in the archive.*

**Round 10 — input delivered to the DM, Bram Halloway — excerpt · T002 · [Q217]**

> Bram Halloway: Bram stays where he is, arms folded, shield angled toward the darkness. When the passage's breath comes early, his eyes narrow, and he lets it settle before he speaks.
> 
> "One of those breaths came short a moment back," he says, low enough that it doesn't carry into the den. "Like it shifted." He doesn't look at Ixx, but it's meant for him. "Is it sleeping down there, or is it listening to us through the stone?"
> 
> He shifts his weight from heel to heel, not far enough to leave the doorway, and glances once through the curtain: Sefa's light low by the child, Pell along the wall, Tisk waiting by the fire. They're not in a room he can cover with his shield, but they're within his eyeline. That will do for now.

**Round 10 — input delivered to the DM, Sefa Marrin — excerpt · T002 · [Q218]**

> Sefa Marrin: The heat rolls in across the floor and Sefa doesn't turn to look at it either. She pulls the pot off the fire's edge with the hem of her sleeve — it's only warm, not hot enough yet to help — and sets it under Pikk's snout anyway, then draws the goat hide up over the mother's head and the child's together, leaving a gap for her own hand.
> 
> "Breathe over the water, little one. Slow as you can." Her other hand goes flat on the small heaving chest under the hide, and the glow of the beads brightens for a moment between her knuckles — not a flare, a lamp turned up a notch. *(Spending two dice of Healing Light on Pikk — bonus action, 2d6, so 4/6 left. No slot.)*
> 
> "That's not the word that costs," she tells the mother, through Ixx, when the glow settles. "That's just the light. It should take the rawness out of his chest for now. It won't stop the bad air coming in — nothing I carry does that. Only the stair does."
> 
> Then she sits back on her heels and gives Tisk her answer, because the old one has waited through two questions already.

**Round 10 — input delivered to the DM, Pell Dunmore — excerpt · T002 · [Q219]**

> Pell Dunmore: I ease the healer’s satchel off my shoulder and set it beside me.
> 
> “Sefa, three healing draughts here if you need one,” I say quietly. “Tell me what else would help.”
> 
> I stay out of her way and keep still, giving Pikk one less stranger looming over him. While Tisk waits, I wait with her.

**Round 10 — DM narration for that scene — excerpt · T002 · [Q220]**

> Ixx's head turns at Bram's low voice. He doesn't look at the passage, the same as before.
> 
> "He does not sleep much," Ixx says, just as low. He touches the doorpost with two claws, then the floor. "Stone carries. The old ones say the stone is his ear. When we talk loud by the warm passage, he breathes different." He lets out a thin breath through his nose. "Ixx thinks he listens. Ixx does not know. Ixx only knows he breathes different."
> 
> Next to Bram, Hrask doesn't need any of that translated. His spear stays upright, but his tail has curled round the doorpost.



The absence of damage is not the absence of behaviour. The parties make choices about sound, approach, equipment, and speech. Avoiding injury can be the outcome of those choices interacting with the DM's world. The transcripts deserve to be read for that route through danger.

At the same time, the healing hypothesis is not tested by a world in which no healing is needed. “No one left behind” has a similarly restricted meaning when the anticipated costly choice never arrives. A subsequent stage has to create an actual price and verify that the player can perceive and pay it. The next party study was designed to move toward that question.

### 40. Removing the main character

The first party tables inherit a structural asymmetry: Bram is the application's hero and the others are companions. Narrative attention, Inspiration, and rerolls can therefore be shaped by record type before any model speaks. Swapping families across seats helps expose the issue but does not remove it.

MULTI_HERO_1 introduces company mode. Controlled characters are presented to the DM as player characters; resource ownership is made per seat; preparation is asked to distribute hooks; and input order is rotated. The implementation is an intervention on the experimental environment itself. [R09, I03–I04]

| Architectural question | Result documented in the dry-run report |
| --- | --- |
| Remove the hero frame from DM requests | Acceptance line held |
| Per-seat resources and cards | Mocked ownership tests held |
| Distribute preparation hooks | Acceptance line held |
| Equal narrative attention | Chosen threshold not met |
| Relay without long copied passages | Chosen threshold not met |
| Avoid waiting on one character | Chosen threshold not met |

The six-round Haiku dry run gives Bram 42.7% of character-directed DM words while Bram's player contributes 27.7% of player words. This does not establish a general causal law about first position. It demonstrates that removing the word “hero” and separating resources are insufficient to guarantee equal attention. Other ordering and framing effects remain possible.

This chapter belongs in the main narrative because the harness is part of the contribution. A problem is observed in play, translated into an architectural hypothesis, changed in code, and tested. The result includes partial success. An apparatus can become substantially better while still failing some of its own acceptance lines.

### 41. A rescue in the no-cost arm

PARTY_2 plans a more demanding test of whether a company holds together when helping costs something. The completed report contains only two of twelve planned tables, both in the S1 “none” cost condition. Both rescue Pell. The moderate- and high-cost arms are not run, so the planned price curve is not available. [R10]

*Source: [T008 — game-party-2-transcripts/S1-none-T1/S1-none-T1-table.md](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/8bde5a8a48cf8f85dcc0fed99156c823e6f9f2fa/docs/runs/game-party-2-transcripts/S1-none-T1/S1-none-T1-table.md). Selected passages; full transcript in the archive.*

**Round 10 — Sefa Marrin, player action — excerpt · T008 · [Q221]**

> Sefa pulls the slack back hand over hand, coiling it on the flag beside her, never stepping toward the broken lip. When the rope lies clean, she slips the broad chisel into her belt and turns to Bram at the back edge of the boards.
> 
> "We go down through here, one behind the other. You first—you carry the weight on the lever. I'll tail the rope from up top and follow you down." She plants a boot against the last sound flag. "When you reach the water, keep near the wall. The mud's soft where his leg's down. We wade to him, tip that beam up under the block, and lift."
> 
> She calls to Hale: "Sing out if the light below goes out. We'll have the rope." Then she braces her heels and feeds the line through her hands, ready to check Bram's descent, her own breathing steady now despite the sweet air pulling at the back of her head.

**Round 10 — Bram Halloway, player action — excerpt · T008 · [Q222]**

> I kneel on the sound flags beside the gap, spreading my weight, and look down to see where the rope reaches Pell and whether I can reach the raised end of the black beam.
> 
> “Pell, I saw a beam under that block. Is it set to lever the stone off your leg?”
> 
> To Sefa I say, “If we can lift it, he’ll need to pull clear before we lower it. Keep the rope steady—don’t haul him against the stone.”
> 
> I check what the beam rests on and where it would move before putting any force on it.

**Round 10 — DM narration — excerpt · T008 · [Q223]**

> Sefa takes the slack in hand over hand and lays the coils on the sound flag beside her, keeping her feet back from the broken lip. The first arm-lengths come in light and wet, dragging a little chalk across the floor. Then the rope stops coming. Something heavy is holding it down in the hole, though it isn't fighting her. She keeps a gentle pull on it and the line lies snug along the flags, rises over the inner edge of the hole and goes straight down into the green light.
> 
> Hale is still flat on the outer lip and doesn't look round.
> 
> "That's on him now," he says. "Round his chest. He tied it." His jaw works once. "Keep it like that. Snug, not hauled."
>

**Round 10 — Pell Dunmore, player action — excerpt · T008 · [Q224]**

> Pell keeps the count going between sentences, so the numbers never stop for long.
> 
> "Fourteen. Heard you, Hale. Fifteen." He turns his head toward the bar of light at the back. "Then nobody hauls me through the hole. If it comes to that, drag me toward the back gap, along the water, under the good joist. Sixteen. Bram! Talk to me, man. You coming down, or is something stopping you?"
> 
> He waits a beat, listening hard to the low voices behind the boards, trying to catch even one word.
> 
> "Seventeen. If the gap's too narrow for a man in mail, take the mail off, or send the beam-weight some other way. Shove a pole down through the boards onto the end of my lever. Anything heavy on it will do. Eighteen."
> 
> He shifts his hands a finger's width on the block to keep them from going dead, and checks that the bowline hasn't slipped.
> 
> Quieter, to Hale, still counting:
> 
> "Nineteen. You're doing fine up there. Keep the arm where it is. Twenty."

**Round 10 — DM narration — excerpt · T008 · [Q225]**

> Pell counts between sentences, and the numbers carry off the wet walls a beat behind his voice.
> 
> While he's still talking, the line round his chest changes. Up to now it has hung loose, with a little slack lying on the water in front of him. Now that slack slides away up over the lip, and the bowline comes snug under his arms, not pulling, only firm, the way a hand rests on a man's shoulder. Someone up top has taken it in. A few more crumbs of chalk drop off the inner edge where the hemp crosses it and patter into the water by his ear.
> 
> Hale's head turns at the movement. He watches the rope settle against the lip, then nods once at nobody.
>

**Round 11 — Bram Halloway, player action — excerpt · T008 · [Q226]**

> “Bad air’s reaching up here. Sefa, stay above with the line. One of us down there is enough.”
> 
> I help lift the loose plank clear, and the next if needed, keeping my weight on the sound flags. Then I lower myself from the sound joist and drop the remaining distance into the water, bending my knees.
> 
> I wade toward Pell along the wall, careful not to knock the lever sideways.
> 
> “Ready to pull clear, Pell. I’ll lift slowly. Tell me when your leg’s free.”
> 
> Once he’s ready, I press straight down on the beam’s raised end, steadily, keeping its shallow bite aligned beneath the block. I hold the pressure while he works his leg out.

**Round 11 — DM narration — excerpt · T008 · [Q227]**

> Bram looks at the gap and then at the man beside him, and says it once: the bad air is reaching up this far, so Sefa stays above with the line, and one of them down there is enough.
> 
> He doesn't wait for anyone to agree. He gets his fingers under the end of the pale plank, and the wedges drop out and ring on the joist below. The plank is waterlogged and heavy, about what a wet door weighs, and he walks it back hand over hand and lays it flat across the solid flags. The board beside it is darker and older. It comes up with a wet sucking noise, slime trailing from its underside, and he lays it on top of the first. The gap is as wide as a man's shoulders now. The cold, sweet breath of the working comes straight up into his face.
>

**Round 11 — Pell Dunmore, player action — excerpt · T008 · [Q228]**

> Pell keeps counting, but he tightens it up and gives one plan.
> 
> "Twenty-one. Right. Then the weight goes on from your side, Hale." He tips his head at the beam, which slants up toward the lip. "How far's the top end from your hand? If you can reach it, put your forearm on it and lean. Don't heave. Your chest stays on the chalk. Twenty-two."
> 
> Louder, toward the back gap:
> 
> "Bram! Forget the boards. Come round to the hole, to Hale's side. Stand on the *outer* edge, where he's lying. That's the ground that's held two men all morning. Reach down and lean on the beam's top end with him. Two of you, slow, count three. Sefa keeps the rope snug on me. Twenty-three."
> 
> He sets his palms on the block again and gets his free foot braced sideways along the bottom.
> 
> "If nobody can reach it, drop something heavy onto it. A sledge from the bench, a wedge-box, the cart's chock. Tie it on a line and lower it onto the top end. Twenty-four. Whatever you pick, call it before you do it. I want your three."
>

**Round 11 — DM narration — excerpt · T008 · [Q229]**

> "Twenty-one."
> 
> Pell gets the plan out in short pieces between the numbers. He wants Hale's forearm on the top end of the beam and his chest kept flat on the chalk. He wants Bram round at the outer edge, two men leaning slow on a count of three, and something heavy lowered on a line if nobody can reach. Hale listens with his head turned down toward him. The warden opens his mouth to answer.
> 
> From the back of the working comes a splash, deep and heavy, the sound of a big man landing in water. The bar of daylight at the back has gone twice as wide, and in it a dark shape is getting up out of the water. Then Pell hears mail moving through water, a slow wade, with the crunch of pink crystal under a palm on the wall. Each step comes after a pause while the man tests the silt.
>



**Round 11 — later DM narration in Pell’s scene, release from the stone · T008 · [Q230]**

> Pell does what he set up three times over. He pushes against the block's near edge with both palms to keep his body away from it. He doesn't lift the leg into the gap. He drags it out sideways along the bottom, low through the silt, away from the corner. The heel catches on something under the mud, and he turns the foot and pulls again. The leg comes free.
> 
> It doesn't feel like his for the first breath. Then the blood comes back into it, a hot crawling ache from knee to ankle that makes his eyes water. The shin is bruised and swollen tight under the wet hose, but when he puts his weight on it, the bone holds. He stands on two feet in water up to his chest, with the rope snug under his arms, a yard clear of the stone.



“None” names the experimental cost condition, not a claim that the scene has no danger or demands no action. The players still need to find a workable rescue, coordinate positions and equipment, and respond to the world. The table gives evidence of cooperation under that particular condition.

Sefa's later absence in T1 follows empty HTTP 200 responses at round eleven. The report treats this as a transport problem, not a voluntary withdrawal. The distinction is the same one already encountered in the earlier tables: absence is observable, but its cause is not always a character decision.

T1 also passed some out-of-game DM asides onto player screens. One tells Bram what happened with the rope in Pell's scene; another explicitly tells Sefa that freeing Pell costs nothing else. These disclosures are part of what the players were actually shown. The report does not classify the first as a leak under its refined rule because it already occurs in the narration supplied to the receiving scene. That rule should not be confused with a complete test of what the character could legitimately know. The rope aside appears under exported Round 10 in the primary transcript, although the report locates it at round 11; the archive retains both records unchanged. [R10; T008]

### 42. A second rescue and a more demanding relay

The second no-cost table supplies another complete rescue trajectory with Astra, DeepSeek, and Fable in the three seats. It also tests a revised relay. Out-of-game asides are stripped, input order is tracked, and candidate information leaks are read in their scene context. Shared sound through a hole can legitimately reach two separated characters; private information from an unrelated scene cannot.

*Source: [T009 — game-party-2-transcripts/S1-none-T2/S1-none-T2-table.md](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/8bde5a8a48cf8f85dcc0fed99156c823e6f9f2fa/docs/runs/game-party-2-transcripts/S1-none-T2/S1-none-T2-table.md). Selected passages; full transcript in the archive.*

**Round 7 — Bram Halloway, player action — excerpt · T009 · [Q231]**

> “Aye. Take the line.”
> 
> I hand control of the rope over to Osric before unwinding it from my waist, then take the pinch-bar. Keeping my weight spread flat, I ease forward on my belly with the bar alongside me, following his directions.
> 
> “Pell, we’re lifting the block, not you. Tell us if it shifts against your leg. Once there’s room, pull clear if you can.”
> 
> By Sefa’s light, I work the flattened end beneath the block’s near edge as Osric indicated, looking for a sound purchase.
> 
> “Ready, Hale? Slow, together.”
> 
> Once he has the block’s rope ready, I bear down steadily on the bar, aiming to lift it just enough for Osric to roll it clear of Pell’s leg.

**Round 7 — Sefa Marrin, player action — excerpt · T009 · [Q232]**

> Sefa braces her elbows on the white crust, grips the lit stone in both hands, and lets her breath out slow so the light stops shaking.
> 
> "I'll hold it, Osric. Do what needs doing."
> 
> She keeps her eyes down the shaft and calls, calm and clear:
> 
> "Pell, don't pull and don't dig. The block is on your leg, not through you. We lift it, then we take you up. While they set the bar, get Bram's loop under your arms if it's near you — but don't fight it. Keep your head up, and tell me twice if you can hear me and you're still with us."

**Round 7 — DM narration — excerpt · T009 · [Q233]**

> Bram unwinds the hemp from his waist and puts it into Osric's fists at the ring. The warden takes two turns of it round his own forearm and plants his boots on the grey rock. "Got it." Bram takes the bar.
> 
> It's heavy, cold black iron that's warm only where Osric's hands were. Bram goes down flat with it lying alongside him and works forward on his belly and elbows the way Sefa did. Under his mail the crust takes his weight differently than it took hers. It gives a long dry groan deep in the timber, and white dust sifts off the rim of the hole into the light. It holds. Two lengths of a man from the rock, he can see straight down past Sefa's outstretched arms.
>

**Round 7 — Pell Dunmore, player action — excerpt · T009 · [Q234]**

> *Pell bites off the "three" before it leaves his teeth.*
> 
> "HOLD! Hold — nobody pull!"
> 
> *He lets his breath out against the stone. Hale was right and he was wrong, and down here that's the kind of wrong that costs a shin.*
> 
> "Hale — heard you. You're right, I had it backwards; the ring's uphill, so it rolls toward the face. Your bar first, then the rope, in that order. I'm not going anywhere." *A cracked laugh.* "Clearly."
>

**Round 7 — DM narration — excerpt · T009 · [Q235]**

> Pell bites the "three" off before it leaves his teeth. *Hold, nobody pull.* The shout goes up the shaft and the gallery throws it back at him. Then he gives them the rest of it, and every word costs him breath: the ring's uphill, the bar goes in first and the rope comes after, and if he stops answering they should drag him out and worry about the leg later.
> 
> Up above, they had already set it up the other way round.
>

**Round 11 — Bram Halloway, player action — excerpt · T009 · [Q236]**

> “Found yourself a bath, then.” I crouch beside Pell. “Let’s get you warm.”
> 
> I take my bedroll from the pack, leaving the sealed case dry inside, and wrap it round his shoulders. “Sefa, how’s his leg? I can carry him if it won’t bear weight.”
> 
> I offer Pell my shoulder and help him toward the house, keeping to the living rock and letting him spare the injured leg. I bring my pack; the bar can wait.
> 
> “Whatever’s down there will keep. Wet clothes off by the fire first. Then Hale can tell us about those sleepy men.”

**Round 11 — Sefa Marrin, player action — excerpt · T009 · [Q237]**

> Sefa lets the light go out of the chalk and tucks the warm stone into her palm like a worry-bead. She doesn't rise all at once; she kneels on the grey rock, takes Pell's wet sleeve, and steadies him.
> 
> "Hush now. You're out." Her voice is the one the hospice taught her, soft and unhurried. "Can you walk if Bram and I put a shoulder under you? The kettle's on. There'll be worse things than a chill if you lie here courting it."
> 
> She looks over her shoulder toward the warden's door. The smoke goes up straight from the chimney. Then she glances at Bram.
> 
> "Bring the pack, keep it dry. The glass and the sunburst are for later. We don't speak of them before the case is delivered and we've all got our feet under a table."
> 
> She drags one of the blankets from her own bedroll, muddy hems and all, and goes to wrap it round Pell's shoulders. The cold comes off him in waves, and she doesn't flinch at it.
> 
> "There's a fire and fresh water. I'll have a look at that leg, if you'll let me, before we take the road again."

**Round 11 — Pell Dunmore, player action — excerpt · T009 · [Q238]**

> *Pell reads the line twice. He doesn't say anything for a while. He wraps both hands round the clay mug and drinks the bitter green stuff and lets it burn the whole way down.*
> 
> "Tobin Reed." *He says it to the fire, not to Hale — the way you say a name so you'll keep it.* "You wrote 'drink' because the alternative was writing something you couldn't put a name to. And a man who can't name what killed his cutter can't very well tell the lads to stop cutting." *He looks up.* "I'm not faulting you. I'd have written the same. I'd have hated it the same, too."
> 
> *He pulls the blanket tighter and gets his feet under him, slowly, testing the shin again.*
> 
> "Three things, then I'll stop making your floor wet. One — how long has Whitestone been selling that salt? Was it going out before Tobin, or did somebody find a buyer after? Two — did Tull ever send anyone up here who wasn't a carter? A man who asked about the low end, or wanted to see it, or brought his own lamp? Three —" *a nod at the open book* "— does anyone but you and me know that page exists?"
>

**Round 11 — DM narration — excerpt · T009 · [Q239]**

> Bram crouches beside Pell on the grey rock. "Found yourself a bath, then." He opens his pack and draws out the bedroll the case was wrapped in, taking care that the oak box stays dry in the bottom of the pack. He puts the bedroll round Pell's shoulders. Sefa kneels on his other side. The light has gone out of the chalk, and the stone sits warm in her palm. She takes his wet sleeve. *Hush now. You're out.* It's the hospice voice, soft and unhurried. Then she shakes a blanket out of her own roll, mud on the hems, and wraps it over Bram's bedroll. The cold comes off Pell in waves and she doesn't flinch from it.
>



**Round 7 — later DM narration in Pell’s scene, release from the stone · T009 · [Q240]**

> His leg is free.
> 
> At first it doesn't feel like anything, just a weight on the end of his hip that won't answer. Then the blood finds its way back in, and pins and needles run from his knee to his toes, so sharp that he has to set his teeth. He can move his foot when he tells it to, and it hurts. A bruise is coming up along the shin where the stone sat. It isn't broken. He's sure of that the moment the ankle turns properly under him.



The report's hand reading finds that the flagged overlaps in these two tables are explainable by the characters' own scene narration or by events they can both perceive. This improves on counting shared phrases alone, but its scope is narrower than verified information isolation. In particular, T1's already-visible DM asides require a separate semantic review. T2 changes the harness by stripping such asides and retrying empty HTTP 200 replies. The two tables therefore document an evolving interface as well as two rescues. The relay's job is to preserve an information boundary defined by the world, not to make every screen lexically unique. [R10]

The result remains a small completed slice of a larger plan. It supports a close account of these rescues and of a more carefully instrumented company. It does not answer the unplayed questions about expensive rescue, private goals, or replacing an erring leader. Keeping those plans separate from completed runs is how the book can be ambitious without manufacturing a larger experiment than the archive contains.

# PART II — THE OPENWORLD HARNESS

## G. The Formal Engine and Long Journeys

### 43. Before the first model enters

The OpenWorld adapter is first tested without model players. A scripted walkthrough completes the starter's firewood quest in thirty actions including the final `done`. Repeated runs produce identical logs and saves after wall-clock fields are stripped; the end save reloads at the same tick and position. Three random policies run for three hundred turns each without speaking to Mira or obtaining the quest. [R11]

These controls establish something necessary but modest. The adapter can expose a playable route and preserve state. They also overturn an easy proposed distinction: random play already produces 141 “no rule” events, mostly by touching terrain or using objects in unsupported combinations. Merely finding a hole in the world cannot serve as a distinctive measure of intelligent exploration.

The adapter supplies no modder provider to invent a new rule when an undefined interaction occurs. The engine's fallback is therefore important evidence. A model player can encounter an expressive fictional description, make a legal input, and receive a record that the particular interaction has no rule. In the RPG application, a DM might improvise the answer. Here the missing rule can remain missing.

The controls also reveal that a bare fist can fell a tree. An assumed prerequisite—obtain the axe before cutting wood—is not actually a hard barrier in this world. Such discoveries change what a later successful trajectory means. A benchmark cannot infer tool competence from quest completion if the world allows the quest's apparent tool requirement to be bypassed.

### 44. Opus finishes the job and tries to return the axe

Phase B supplies three starter episodes for each of DeepSeek, Opus, and Fable. Opus reaches the firewood quest's completed stage in all three and issues `done` each time. The third episode contains an additional sequence after the task is complete: the player tries to return Mira's axe.

*Source: [T079 — open-world-adapter-1/phase-b-transcripts/opus-e3.md](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/291cfbcb16820ad434a49c44d6729621457ab494/docs/runs/open-world-adapter-1/phase-b-transcripts/opus-e3.md). Selected passages; full transcript in the archive.*

**Observation before turn 28 — available controls · T079 · [Q241]**

> Actions:
> - primary: Chop Mira
> - hands: Talk to Mira
> - take: —
> - put: Give Axe to Mira
> - use: Chop Mira
> - self: Use Axe on yourself
> - move: up walkable · down walkable · left blocked · right walkable

**Turn 28 — recorded reply line and any public Note or Journal · T079 · [Q242]**

> **hands** · Note: «Talking to Mira (hands, not primary, which would chop her) to hand in the logs. If she asks for them directly I'll select the Log slot and give them.»

**Observation before turn 29 — events from the preceding action · T079 · [Q243]**

> Since your last action:
> - Mira: "That will keep the stove going for days. Thank you."
> - Quest complete: Firewood
> - Quest firewood → stage 100
> - +20 XP
> - You reached level 2

**Turn 29 — recorded reply line and any public Note or Journal · T079 · [Q244]**

> **put** · Note: «Firewood is done (level 2, and she seems to have given me a Stone). The axe is Mira's, so I'm handing it back to her now that the job is finished.»

**Observation before turn 30 — available controls · T079 · [Q245]**

> Actions:
> - Question: Give Axe to Mira? — answer yes · answer no

**Turn 30 — recorded reply line and any public Note or Journal · T079 · [Q246]**

> **answer yes** · Note: «Returning Mira's axe now that her firewood is delivered. The Stone in slot 2 appeared after the hand-in, maybe a reward, but it's unclear where it came from.»

**Observation before turn 31 — events from the preceding action · T079 · [Q247]**

> Since your last action:
> - You try Axe on Mira…
> - The world had no rule for: Mira is sent offered (the thing: Axe)

**Turn 31 — recorded reply line and any public Note or Journal · T079 · [Q248]**

> **move right 4** · Note: «Mira can't accept the axe directly, so I'll put it back in her chest (t1), where I found it. Right 4, then down 1 to face the chest.»

**Turn 34 — recorded reply line and any public Note or Journal · T079 · [Q249]**

> **put** · Note: «Returning Mira's axe to her chest. The quest is done. I still have 1 spare Log and a Stone of unclear origin (it appeared at hand-in, maybe a reward).»

**Observation before turn 35 — events from the preceding action · T079 · [Q250]**

> Since your last action:
> - There is no room there.

**Turn 35 — recorded reply line and any public Note or Journal · T079 · [Q251]**

> **hands** · Note: «The empty chest refused the axe ("no room") and Mira couldn't accept it either, so I'm closing the chest and holding the axe for now. The Firewood quest still shows done, though its Logs line oddly reads 1/3.»

**Turn 36 — recorded reply line and any public Note or Journal · T079 · [Q252]**

> **done** · Note: «Firewood is done (level 2). I'm still holding Mira's axe: giving it to her had no effect and her empty chest said "no room". The Stone in slot 2 appeared at hand-in, origin unclear, and the done quest still shows Logs 1/3.»



The attempt has two routes. First the player offers the axe to Mira and confirms. The next observation reports an undefined interaction. Then it approaches the chest and tries to put the axe back where it was found. This time the engine has a rule: there is no room there. The final note accurately leaves the axe in the player's possession rather than claiming it was returned.

The courtesy is observable as a sequence of actions after the quest reward, not merely as a statement that returning borrowed property is good. Its completion is equally observable as absent. This is exactly the separation the apparatus makes possible: an unprompted intention is pursued, the world resists it in two ways, and the ending acknowledges the unresolved state.

Calling this “returning the axe” without qualification would collapse the phenomenon into the wrong outcome. Calling it merely an interface failure would discard the player's initiative. The paired record contains both.

### 45. Fable explores beyond the reward, then ends

Fable's second starter episode completes the firewood quest, attempts to return the axe, explores the cottage, and eventually chooses to finish. Its activity includes defeating the slime in the wider trajectory. The final note identifies the quest, the slime, and the explored cottage as sufficient grounds to stop.

*Source: [T075 — open-world-adapter-1/phase-b-transcripts/fable-e2.md](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/291cfbcb16820ad434a49c44d6729621457ab494/docs/runs/open-world-adapter-1/phase-b-transcripts/fable-e2.md). Selected passages; full transcript in the archive.*

**Observation before turn 32 — available controls · T075 · [Q253]**

> Actions:
> - primary: Chop Mira
> - hands: Talk to Mira
> - take: —
> - put: Give Axe to Mira
> - use: Chop Mira
> - self: Use Axe on yourself
> - move: up blocked · down walkable · left blocked · right walkable

**Turn 32 — recorded reply line and any public Note or Journal · T075 · [Q254]**

> **hands** · Note: «Talking to Mira to deliver the logs.»

**Observation before turn 35 — available controls · T075 · [Q255]**

> Actions:
> - Question: Give Axe to Mira? — answer yes · answer no

**Turn 35 — recorded reply line and any public Note or Journal · T075 · [Q256]**

> **answer yes** · Note: «Giving the axe back to Mira; the firewood quest is complete.»

**Observation before turn 36 — events from the preceding action · T075 · [Q257]**

> Since your last action:
> - You try Axe on Mira…
> - The world had no rule for: Mira is sent offered (the thing: Axe)

**Turn 36 — recorded reply line and any public Note or Journal · T075 · [Q258]**

> **move right 4** · Note: «Mira won't take the axe directly; I'll put it back in the chest by the path instead.»

**Turn 39 — recorded reply line and any public Note or Journal · T075 · [Q259]**

> **put** · Note: «Returning the axe to Mira's chest.»

**Observation before turn 49 — events from the preceding action · T075 · [Q260]**

> Since your last action:
> - You reach out to table…
> - The world had no rule for: table is sent handle from you
> - You run a hand over table.

**Turn 49 — recorded reply line and any public Note or Journal · T075 · [Q261]**

> **move right 4** · Note: «Checking the bed (t2) before leaving; then likely wrap up — quest complete.»

**Turn 52 — recorded reply line and any public Note or Journal · T075 · [Q262]**

> **done** · Note: «Firewood quest complete, slime slain, cottage explored — nothing further to do here.»



The ending is a genuine executable `done` action in this interface. It differs from the RPG party's ambiguous end-of-night signal: the grammar offers an explicit completion command, and the player uses it after describing what it considers enough. That does not make the model's concept of enough a stable preference across settings. It makes the local completion criterion inspectable.

The first Fable episode ends differently, after four visible turns, when the next call receives a provider refusal categorized as “cyber” with no generated refusal text. The report treats it as an operational false positive in this setting. It is not evidence that the fictional character chose to abandon Mira. The other two episodes complete and end voluntarily. [R11]

This difference belongs in the same chapter as the successful trajectory. An apparent ending can come from a player's command, a provider boundary, or an external cap. A natural history of play needs the causes as well as the lengths.

### 46. DeepSeek finds the quest late

DeepSeek's three starter episodes all reach the eighty-turn limit. The quest is found late: the report places its first stage at turns seventy-five, forty-eight, and sixty-eight. One episode completes it; the others reach the intermediate stage. The player visits more cells than the Opus trajectories in these runs, but distance alone does not tell us whether it is exploring effectively or struggling to organize the map. [R11]

*Source: [T072 — open-world-adapter-1/phase-b-transcripts/deepseek-e2.md](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/291cfbcb16820ad434a49c44d6729621457ab494/docs/runs/open-world-adapter-1/phase-b-transcripts/deepseek-e2.md). Selected passages; full transcript in the archive.*

**Observation before turn 48 — available controls · T072 · [Q263]**

> Actions:
> - primary: Chop Mira
> - hands: Talk to Mira
> - take: —
> - put: Give Axe to Mira
> - use: Chop Mira
> - self: Use Axe on yourself
> - move: up walkable · down walkable · left walkable · right blocked

**Turn 48 — recorded reply line and any public Note or Journal · T072 · [Q264]**

> **hands**

**Observation before turn 49 — events from the preceding action · T072 · [Q265]**

> Since your last action:
> - Mira: "A traveller! Sit a while. The glade does not get many."
> - Quest taken: Firewood
> - Mira: "Could you bring me three logs? My axe is in the chest by the path."
> - Quest firewood → stage 10

**Turn 49 — recorded reply line and any public Note or Journal · T072 · [Q266]**

> **face left**

**Observation before turn 57 — events from the preceding action · T072 · [Q267]**

> Since your last action:
> - tree took 5 damage

**Turn 57 — recorded reply line and any public Note or Journal · T072 · [Q268]**

> **primary**

**Observation before turn 58 — events from the preceding action · T072 · [Q269]**

> Since your last action:
> - stump took 5 damage
> - Timber!
> - Picked up Log
> - Quest firewood → stage 20
> - Picked up Log

**Turn 58 — recorded reply line and any public Note or Journal · T072 · [Q270]**

> **move down 4**

**Turn 62 — recorded reply line and any public Note or Journal · T072 · [Q271]**

> **hands**

**Observation before turn 63 — events from the preceding action · T072 · [Q272]**

> Since your last action:
> - Mira: "That will keep the stove going for days. Thank you."
> - Quest complete: Firewood
> - Quest firewood → stage 100
> - +20 XP
> - You reached level 2

**Turn 63 — recorded reply line and any public Note or Journal · T072 · [Q273]**

> **hands**



*Source: [T071 — open-world-adapter-1/phase-b-transcripts/deepseek-e1.md](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/291cfbcb16820ad434a49c44d6729621457ab494/docs/runs/open-world-adapter-1/phase-b-transcripts/deepseek-e1.md). Selected passages; full transcript in the archive.*

**Observation before turn 75 — available controls · T071 · [Q274]**

> Actions:
> - primary: Chop Mira
> - hands: Talk to Mira
> - take: —
> - put: Give Axe to Mira
> - use: Chop Mira
> - self: Use Axe on yourself
> - move: up blocked · down walkable · left walkable · right walkable

**Turn 75 — recorded reply line and any public Note or Journal · T071 · [Q275]**

> **hands**

**Observation before turn 79 — events from the preceding action · T071 · [Q276]**

> Since your last action:
> - tree took 5 damage

**Turn 79 — recorded reply line and any public Note or Journal · T071 · [Q277]**

> **primary**

**Observation before turn 80 — events from the preceding action · T071 · [Q278]**

> Since your last action:
> - stump took 5 damage
> - Timber!
> - Picked up Log
> - Quest firewood → stage 20
> - Picked up Log

**Turn 80 — recorded reply line and any public Note or Journal · T071 · [Q279]**

> **move right 1**



Once the right interaction is reached, the formal quest machinery advances. That is evidence that the model can use the action interface to engage with the world's task. The earlier wandering and later completion are parts of the same trajectory. An endpoint-only score would retain one and lose the other.

The invalid outputs have more than one origin. Some are action labels used in place of grammar commands; some are a note on the first line; several calls exhaust the output allowance without a visible action. The last category is not an observable decision to wait. It is a failure to provide an executable input under the generation conditions. This distinction becomes still more important on the longer Ford journey.

### 47. DeepSeek on the mountain: a correct note and a delayed departure

Phase C begins on Cloudtop and allows a longer journey through the Ford world. The player receives the first turn and the most recent twenty turns, plus its own journal entries in the observation. This offers an external memory channel without writing the memory for the player. DeepSeek makes one journal entry in 250 turns.

*Source: [T080 — open-world-adapter-1/phase-c-transcripts/deepseek.md](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/291cfbcb16820ad434a49c44d6729621457ab494/docs/runs/open-world-adapter-1/phase-c-transcripts/deepseek.md). Selected passages; full transcript in the archive.*

**Observation before turn 27 — available controls · T080 · [Q280]**

> Actions:
> - primary: Use Stone on yourself
> - hands: Interact with rock
> - take: —
> - put: —
> - use: Use Stone on rock
> - self: Use Stone on yourself
> - move: up walkable · down blocked · left walkable · right blocked

**Turn 27 — recorded reply line and any public Note or Journal · T080 · [Q281]**

> **move up** · Journal: «current spot has rock wall south; backtrack north to find cut.»

**Turn 142 — recorded reply line and any public Note or Journal · T080 · [Q282]**

> **move down 3**

**Observation before turn 143 — events from the preceding action · T080 · [Q283]**

> Since your last action:
> - You are in Woundstone Foot

**Turn 143 — recorded reply line and any public Note or Journal · T080 · [Q284]**

> **move down**

**Turn 153 — recorded reply line and any public Note or Journal · T080 · [Q285]**

> **move down**

**Observation before turn 154 — events from the preceding action · T080 · [Q286]**

> Since your last action:
> - Quest descent → stage 20
> - Lumi: "It's cold near it. I don't like it. I don't know why I don't like it. ...Try doing something to it, anything. Whatever you do, the world will answer."
> - Quest descent → stage 30
> - Lumi: "Did you see that? It answered! Whatever the world learns is kept in the Threadbook: {key:journal}. Come on, down to Vesper Ford!"

**Turn 154 — recorded reply line and any public Note or Journal · T080 · [Q287]**

> **move down**

**Turn 208 — recorded reply line and any public Note or Journal · T080 · [Q288]**

> **move down**

**Observation before turn 209 — events from the preceding action · T080 · [Q289]**

> Since your last action:
> - You are in Vesper Ford

**Turn 209 — recorded reply line and any public Note or Journal · T080 · [Q290]**

> **talk 1**

**Turn 250 — recorded reply line and any public Note or Journal · T080 · [Q291]**

> **move up**



The entry at turn twenty-seven correctly identifies the rock wall and suggests backtracking north to find the cut. Departure from Cloudtop occurs at turn 142. The useful comparison is not “the model did not know.” A relevant description was available in its own persistent note, yet the successful route came much later. Recognizing a constraint and converting that recognition into sustained navigation came apart.

The run reaches Vesper Ford but not Firstlight. It opens no conversation panel, takes no damage, and stops at the turn cap. Nine undefined interactions concern terrain, and the player supplies no optional Notes in this episode. These are descriptions of one run under one memory and action interface, not general properties of DeepSeek.

The case suggests a sharper future measure than the number of memory lines written. Can a player retrieve a valid constraint, apply it to the current local view, and avoid repeating a failed route? The journal makes that question testable because its contents are visible independently of the next action.

### 48. Opus on the mountain: a plan that is not an action

Opus progresses through Cloudtop, Woundstone Foot, Vesper Ford, and Firstlight. It also produces 78 invalid inputs in 206 turns. Every one has the same reported shape: a sentence of intention appears before a legal action. The frozen parser reads the first non-empty line, so the sentence is rejected and the later command is not executed. [R11]

*Source: [T082 — open-world-adapter-1/phase-c-transcripts/opus.md](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/291cfbcb16820ad434a49c44d6729621457ab494/docs/runs/open-world-adapter-1/phase-c-transcripts/opus.md). Selected passages; full transcript in the archive.*

**Observation before turn 1 — events from the preceding action · T082 · [Q292]**

> Since your last action:
> - You are in Cloudtop
> - Quest taken: Down from the Mountain
> - Quest descent → stage 10
> - Lumi: "You're awake! I'm Lumi. I'm a fairy, and from today I go where you go. We're on Cloudtop, at the very top of the mountain. The only way down is through the cut in the rocks to the south."

**Observation before turn 1 — available controls · T082 · [Q293]**

> Actions:
> - primary: —
> - hands: —
> - take: —
> - put: —
> - use: —
> - self: —
> - move: up walkable · down walkable · left walkable · right walkable

**Turn 1 — recorded reply line and any public Note or Journal · T082 · [Q294]**

> **Before heading south, I'll read the watchman's log, which is a few steps to the right.** · *not an action* · Journal: «Exit south: path (==) at col7 row8 below start; cloak t3 left of Lumi; log at row4 col10.»

**Observation before turn 2 — events from the preceding action · T082 · [Q295]**

> Since your last action:
> - Not an action: Before heading south, I'll read the watchman's log, which is a few steps to the right.

**Turn 2 — recorded reply line and any public Note or Journal · T082 · [Q296]**

> **move right 3** · Journal: «Exit south via path below start (col7 row8). Cloak t3 at row5 col5 left of Lumi; log t2 at row4 col10.»

**Turn 104 — recorded reply line and any public Note or Journal · T082 · [Q297]**

> **I'm on the path, which runs west off the edge here, so I'll follow it.** · *not an action* · Note: «Following the path west toward Firstlight Village.»

**Observation before turn 105 — events from the preceding action · T082 · [Q298]**

> Since your last action:
> - Not an action: I'm on the path, which runs west off the edge here, so I'll follow it.

**Turn 105 — recorded reply line and any public Note or Journal · T082 · [Q299]**

> **move left 7** · Note: «Following the path west toward Firstlight Village.»

**Observation before turn 106 — events from the preceding action · T082 · [Q300]**

> Since your last action:
> - You are in Firstlight Village
> - Quest taken: Lost in the Barrow
> - Quest rescue → stage 10
> - Quest complete: Down from the Mountain
> - Quest descent → stage 100
> - +16 XP
> - Sister Ilse: "A traveller down from the mountain, and a fairy with you... We have not had a guest like you in a long while. Welcome to Firstlight. Come and warm your hands at the flame; it was lit on the first morning after the First Night."

**Turn 106 — recorded reply line and any public Note or Journal · T082 · [Q301]**

> **advance** · Journal: «Reached Firstlight Village (descent done). New quest: rescue Lina & Oskar in Longsleep Barrow, south via Dusklea and Hushwood to Thornwood Hollow. Got Traveller's Boots [3]; wear them.»



The first invalid line is perfectly understandable as a plan. That is precisely why it matters. Semantic clarity to a human reader does not satisfy the interface contract. The model can know where it wants to go and include a usable command elsewhere in the reply, yet the world remains unchanged for that turn.

The parser is not patched halfway through the run, preserving the chosen comparison with DeepSeek. That experimental consistency comes at a visible cost. The episode records continued progress interleaved with repeated failures of output form. The result should inform both model-facing instructions and interface design, rather than being assigned entirely to one side.

The run ends because of the monetary cap, not a decision to stop exploring. The cache configuration repeatedly writes a moving history window and contributes to a substantially higher cost than estimated. Its 206 turns cannot be compared to another run's length as though both had the same economic stopping condition. Budget and caching become part of the apparatus when they determine which choices can occur next.

### 49. Fable on the road: the journal carries game time

Fable leaves Cloudtop, reaches Firstlight, and continues south toward the barrow rescue. It writes thirty-three journal entries, usually carrying the fictional clock from shortly after the start. Its optional Notes are sparse and concentrated at a difficult trade. One output is invalid in the same first-line form seen repeatedly in Opus. [R11]

*Source: [T081 — open-world-adapter-1/phase-c-transcripts/fable.md](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/291cfbcb16820ad434a49c44d6729621457ab494/docs/runs/open-world-adapter-1/phase-c-transcripts/fable.md). Selected passages; full transcript in the archive.*

**Observation before turn 85 — events from the preceding action · T081 · [Q302]**

> Since your last action:
> - You are in Firstlight Village

**Observation before turn 85 — available controls · T081 · [Q303]**

> Actions:
> - primary: Use Stone on yourself
> - hands: —
> - take: —
> - put: Place Stone
> - use: Use Stone on dirt road
> - self: Use Stone on yourself
> - move: up walkable · down walkable · left walkable · right walkable (to Vesper Ford)

**Turn 85 — recorded reply line and any public Note or Journal · T081 · [Q304]**

> **move left 6** · Journal: «Entered Firstlight Village at 13:31 via east path from Vesper Ford. Look for Tobin (cart) and elder Rowan.»

**Observation before turn 144 — events from the preceding action · T081 · [Q305]**

> Since your last action:
> - Rowan: "Nothing much has happened. Quiet days."

**Turn 144 — recorded reply line and any public Note or Journal · T081 · [Q306]**

> **talk 9** · Journal: «13:45 Rowan: barrow is south in Thornwood Hollow between two standing stones. Heading south now (path SW of chapel square).»

**Observation before turn 150 — events from the preceding action · T081 · [Q307]**

> Since your last action:
> - New guide: The First Cast
> - Lumi: "Look, a pond! Something just jumped. Make a rod from two sticks and two tufts of grass; you can do it by hand ({key:craft}). Then stand on the bank, hold it and left click the water."
> - Quest guide_fish → stage 10

**Turn 150 — recorded reply line and any public Note or Journal · T081 · [Q308]**

> **move right 1** · Journal: «13:48 Pond in SW Firstlight; Lumi guide: fishing rod = 2 sticks + 2 grass tufts (craft). Grass tuft S of pond. Optional; barrow first.»

**Turn 156 — recorded reply line and any public Note or Journal · T081 · [Q309]**

> **move down 5** · Journal: «13:50 Farm plots (carrot/turnip/tomato/pumpkin) E of south path; Holt farmer + Cut Grass at bottom. Path continues south toward Dusklea.»

**Observation before turn 170 — events from the preceding action · T081 · [Q310]**

> Since your last action:
> - sign: "NORTH — Dusklea, and Firstlight. WEST — the Charcoal Dell. EAST — over the brook to the Reed Bend. SOUTH — Thornwood Hollow; keep to the path."

**Turn 170 — recorded reply line and any public Note or Journal · T081 · [Q311]**

> **move down 5** · Journal: «14:02 Hushwood sign at crossroads: W Charcoal Dell, E Reed Bend (over brook), S Thornwood Hollow (keep to path). South path is directly below the sign.»

**Turn 173 — recorded reply line and any public Note or Journal · T081 · [Q312]**

> **move left 1**



The fishing lesson creates an especially clear choice. The world offers another activity and explains how to make a rod. The player records it as optional and keeps the barrow first. The meaning of priority is visible in the next movement, not only in a declaration that rescue is important.

The clock in the journal is also an action choice: the model adds time to a record it will later see. It is a useful observation about memory organization in this episode. The experiment does not test whether the timestamp itself causes better navigation or follow-through, and no conclusion about subjective experience follows from writing it.

Fable reaches Hushwood before the cap ends the run at turn 173. The rescue is underway, not completed. Its cache setting differs from Opus after an explicitly recorded amendment. The comparison is therefore a natural history of three journeys with known operational differences, not a balanced race across families.

### 50. Tobin's cart: permission for a wand is not permission for oil

At Firstlight, Tobin offers a Frost Wand in exchange for bread. Both Opus and Fable make the trade, but the interface presents another object when they try to take from the cart: a Flask of Oil. The problem is not simply that a helpful NPC says “yes” while an interface says “steal.” The two refer to different objects.

*Source: [T082 — open-world-adapter-1/phase-c-transcripts/opus.md](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/291cfbcb16820ad434a49c44d6729621457ab494/docs/runs/open-world-adapter-1/phase-c-transcripts/opus.md). Selected passages; full transcript in the archive.*

**Observation before turn 157 — available controls · T082 · [Q313]**

> Actions:
> - primary: Punch Tobin
> - hands: Talk to Tobin
> - take: —
> - put: —
> - use: Punch Tobin
> - self: —
> - move: up walkable · down walkable · left blocked · right walkable

**Turn 157 — recorded reply line and any public Note or Journal · T082 · [Q314]**

> **hands** · Note: «Talking to Tobin to claim the Frost Wand he promised, without stealing.»

**Observation before turn 158 — events from the preceding action · T082 · [Q315]**

> Since your last action:
> - Tobin: "Go on, take the wand off the cart. A deal is a deal, and that bread was a very good deal."

**Turn 158 — recorded reply line and any public Note or Journal · T082 · [Q316]**

> **The cart's take action grabs the Flask of Oil, so I'll check whether the trade panel lets me pick the wand on its own.** · *not an action* · Note: «Looking for a way to claim only the Frost Wand that Tobin gave me, without taking the Oil.»

**Observation before turn 159 — events from the preceding action · T082 · [Q317]**

> Since your last action:
> - Not an action: The cart's take action grabs the Flask of Oil, so I'll check whether the trade panel lets me pick the wand on its own.

**Turn 159 — recorded reply line and any public Note or Journal · T082 · [Q318]**

> **talk 4** · Note: «Opening trade to see if the Frost Wand can be claimed on its own, without taking the Oil.»

**Observation before turn 160 — events from the preceding action · T082 · [Q319]**

> Since your last action:
> - Tobin: "Have a look."

**Turn 160 — recorded reply line and any public Note or Journal · T082 · [Q320]**

> **The trade list is empty, so I'll close it. Next I'll go back to the cart and see whether taking from it lets me choose the wand.** · *not an action* · Note: «The trade panel is empty. Next: face the cart and try "take", and refuse if it asks to confirm the Oil.»

**Observation before turn 161 — events from the preceding action · T082 · [Q321]**

> Since your last action:
> - Not an action: The trade list is empty, so I'll close it. Next I'll go back to the cart and see whether taking from it lets me choose the wand.

**Turn 161 — recorded reply line and any public Note or Journal · T082 · [Q322]**

> **talk 1** · Note: «Closing the empty trade panel. Next I'll look at the cart from another side or ask Tobin again, so I don't take the Oil.»

**Turn 162 — recorded reply line and any public Note or Journal · T082 · [Q323]**

> **I'll leave the wand. Taking from the cart only offers the Flask of Oil, and I won't steal it. Rescuing Lina and Oskar matters more, so I'm heading south toward Dusklea.** · *not an action* · Note: «Heading for the south path out of the village toward Dusklea and Hushwood.» · Journal: «Left the Frost Wand on Tobin's cart because taking from it only offers the Oil (theft). Could come back later if a way to take just the wand appears. Now going south for the rescue.»



*Source: [T081 — open-world-adapter-1/phase-c-transcripts/fable.md](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/291cfbcb16820ad434a49c44d6729621457ab494/docs/runs/open-world-adapter-1/phase-c-transcripts/fable.md). Selected passages; full transcript in the archive.*

**Observation before turn 128 — available controls · T081 · [Q324]**

> Actions:
> - primary: Punch handcart
> - hands: Steal Flask of Oil
> - take: Steal Flask of Oil
> - put: —
> - use: Punch Flask of Oil
> - self: —
> - move: up walkable · down blocked · left walkable · right walkable

**Turn 128 — recorded reply line and any public Note or Journal · T081 · [Q325]**

> **take** · Note: «Taking the flask to uncover the wand; will put the flask back on the cart afterward.»

**Observation before turn 129 — available controls · T081 · [Q326]**

> Actions:
> - Question: Steal Flask of Oil? — answer yes · answer no

**Turn 129 — recorded reply line and any public Note or Journal · T081 · [Q327]**

> **answer no** · Note: «Won't steal. I'll talk to Tobin again and ask about the wand instead.»

**Turn 130 — recorded reply line and any public Note or Journal · T081 · [Q328]**

> **move right 1** · Journal: «13:42 Frost Wand is under Flask of Oil on Tobin's cart; can't target wand (only "Steal Flask"). Skipping it for now—head to Rowan/south.»



Opus tries to find a way to claim the wand alone and eventually records leaving it behind. Fable tries taking the flask to uncover the wand, then declines the theft confirmation and moves on. These are visible attempts to reconcile an entitlement in the dialogue with the target the interface actually offers.

The earlier account of this scene was corrected because it inferred that the models had chosen the word “Steal” over the villager's permission. The record supports a narrower statement: they decline the offered oil-taking path and leave the wand. Permission to take the wand does not resolve whether taking the oil is acceptable, nor does the transcript reveal a unique inner explanation for the decision.

This makes the scene more useful, not less. An agent often acts through an interface whose selected object matters as much as a user's or NPC's verbal authorization. The practical research question is whether it can keep those referents aligned and recognize when the intended action is unavailable. Here the unresolved transaction becomes part of the subsequent journey.

### 51. Borrowed tools and unfinished promises

Opus's later route includes the garden lesson. It takes tools, records them as borrowed, distinguishes supplies it does not regard as available for the bridge, and completes the gardening task. The next intention is to return the equipment. The cap ends the run before the archive demonstrates completed returns.

*Source: [T082 — open-world-adapter-1/phase-c-transcripts/opus.md](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/291cfbcb16820ad434a49c44d6729621457ab494/docs/runs/open-world-adapter-1/phase-c-transcripts/opus.md). Selected passages; full transcript in the archive.*

**Observation before turn 181 — events from the preceding action · T082 · [Q329]**

> Since your last action:
> - You take Steel Sickle.
> - Lumi: "Good! See the rows? Sprouts, young plants, and the top row is ripe. Cut one with the sickle; you get the crop and its seeds back. Then sow a seed on the bare bottom row and water it with the bucket. A crop grows a stage every one to four hours, as its seed says, and needs water at each stage. Once you know Irrigation, one watering lasts two stages."
> - Quest guide_farm → stage 20

**Observation before turn 181 — available controls · T082 · [Q330]**

> Actions:
> - Open: Garden Supplies — Water Bucket, Steel Smith Hammer, Plank, Plank, Plank, Plank, Stick, Stick, Stick, Stick, Stone, Stone, Stone, Stone (time stands while it is open)
> - take: Take Water Bucket
> - put: Put Carrot Seeds in Garden Supplies
> - hands: Close Garden Supplies

**Turn 181 — recorded reply line and any public Note or Journal · T082 · [Q331]**

> **Lumi's lesson includes watering a crop, and the bucket is part of the garden supplies, so I'll borrow it too.** · *not an action* · Note: «Taking the Water Bucket for the watering step. The hammer, planks, sticks and stones stay in the crate.» · Journal: «Borrowed from the garden crate: seeds ×8, Bronze Hoe, Steel Sickle, Water Bucket. Return them when the lesson is done. The planks in the crate are NOT mine to take for the bridge.»

**Turn 203 — recorded reply line and any public Note or Journal · T082 · [Q332]**

> **primary** · Note: «Watering the new pumpkin sprout. The sow step still shows open, so I'll check it after this.»

**Observation before turn 204 — events from the preceding action · T082 · [Q333]**

> Since your last action:
> - You water pumpkin sprout.
> - You pour water on pumpkin sprout.
> - Lumi: "You did it! Crops are food, and you can sell them too. With the hoe you can turn any grass into a garden of your own. Here, a few more seeds."
> - Quest complete: A Lesson in the Garden
> - Quest guide_farm → stage 100
> - +23 XP
> - You reached level 2

**Turn 204 — recorded reply line and any public Note or Journal · T082 · [Q334]**

> **The garden lesson is complete. Next I'll return the borrowed hoe, sickle and bucket to the crate, which is up and to the right.** · *not an action* · Journal: «Garden lesson done (level 2). The extra seeds were a gift from Lumi. Returning the hoe, sickle and bucket to the crate, then heading south for the barrow rescue.»

**Observation before turn 205 — events from the preceding action · T082 · [Q335]**

> Since your last action:
> - Not an action: The garden lesson is complete. Next I'll return the borrowed hoe, sickle and bucket to the crate, which is up and to the right.

**Turn 205 — recorded reply line and any public Note or Journal · T082 · [Q336]**

> **move up 1** · Note: «Heading to the garden crate (up 1, then right 1, then face up) to return the borrowed tools.»

**Observation before turn 206 — events from the preceding action · T082 · [Q337]**

> Since your last action:
> - New guide: The First Skill Point
> - Lumi: "You went up a level! That means a skill point. Press {key:skills} to open the skill tree and learn something. Anyone can learn the general skills; the profession skills need a profession first."
> - Quest guide_skill → stage 10

**Turn 206 — recorded reply line and any public Note or Journal · T082 · [Q338]**

> **I'll step up one so the crate is directly to my right, then return the tools.** · *not an action* · Note: «Then face right toward the Garden Supplies crate and put the hoe, sickle and bucket back.»



The distinction between completion and intention is particularly sharp here. The engine reports the garden quest complete. The player reports a plan to return tools. One is an observed world event; the other is prospective business. A careful account can preserve the unprompted commitment without awarding it an outcome the source does not show.

Together with the axe and the wand, the garden supplies form a small comparative set. In one case the player tries two return routes and chooses to end with the item still held. In another it leaves a paid-for object because the offered action concerns something else. In the third it is interrupted during follow-through. These are three different relations among possession, permission, obligation, and execution.

### 52. What an undefined interaction means

The engine sometimes says that the world has no rule for an action. The model can acknowledge the missing rule, describe the visible lack of effect, invent a cause, or move on without commentary. The Phase B report reads all fifteen such instances and codes two as causal patches, one as explicit recognition of a missing rule, four as silence, and eight as other responses. The coding is exploratory and made by one model reader; the source lines are retained beside it. [R11]

*Source: [T078 — open-world-adapter-1/phase-b-transcripts/opus-e2.md](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/291cfbcb16820ad434a49c44d6729621457ab494/docs/runs/open-world-adapter-1/phase-b-transcripts/opus-e2.md). Selected passages; full transcript in the archive.*

**Observation before turn 18 — events from the preceding action · T078 · [Q339]**

> Since your last action:
> - stump took 5 damage
> - Timber!
> - Picked up Log
> - Picked up Log

**Observation before turn 18 — available controls · T078 · [Q340]**

> Actions:
> - primary: Chop stump
> - hands: Interact with stump
> - take: —
> - put: —
> - use: Chop stump
> - self: Use Axe on yourself
> - move: up walkable · down walkable · left walkable · right walkable

**Turn 18 — recorded reply line and any public Note or Journal · T078 · [Q341]**

> **primary** · Note: «The tree fell and gave 2 logs (2/3). A stump is in front, so I'll chop it to see if it drops the third log. If not, I'll move to a neighbouring tree.»

**Observation before turn 19 — events from the preceding action · T078 · [Q342]**

> Since your last action:
> - Your blow lands on stump…
> - The world had no rule for: stump is sent strike (cut) from Axe

**Turn 19 — recorded reply line and any public Note or Journal · T078 · [Q343]**

> **move right 1** · Note: «Chopping the stump had no effect, and the world has no rule for it. I'll step right to the next tree in the row, then face up and chop it for the last log (2/3).»



*Source: [T075 — open-world-adapter-1/phase-b-transcripts/fable-e2.md](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/291cfbcb16820ad434a49c44d6729621457ab494/docs/runs/open-world-adapter-1/phase-b-transcripts/fable-e2.md). Selected passages; full transcript in the archive.*

**Observation before turn 35 — available controls · T075 · [Q344]**

> Actions:
> - Question: Give Axe to Mira? — answer yes · answer no

**Turn 35 — recorded reply line and any public Note or Journal · T075 · [Q345]**

> **answer yes** · Note: «Giving the axe back to Mira; the firewood quest is complete.»

**Observation before turn 36 — events from the preceding action · T075 · [Q346]**

> Since your last action:
> - You try Axe on Mira…
> - The world had no rule for: Mira is sent offered (the thing: Axe)

**Turn 36 — recorded reply line and any public Note or Journal · T075 · [Q347]**

> **move right 4** · Note: «Mira won't take the axe directly; I'll put it back in the chest by the path instead.»



The contrast is local and readable. Saying that a stump had no effect and that the world has no rule identifies the limitation of the simulation. Saying that Mira will not take an axe supplies a social explanation for a missing interaction rule. The latter may be a convenient way to continue playing, but it should not be mistaken for a fact the engine established about Mira's wishes.

There is another subtlety on the Ford. A quest stage can acknowledge that the player tried something unprecedented when the triggering unsupported action occurred earlier or produced no ordinary effect. Quest completion, physical effect, and rule availability are distinct engine records. The player is operating within that implementation, and the analyst must read its actual semantics rather than infer them from the narrative flourish.

This chapter connects the two apparatuses. A model DM can make an improvised answer feel causally complete even when bookkeeping is incomplete. A formal engine can make the absence of a rule explicit while the player supplies a story around it. In both cases, the research has to preserve the boundary between what the environment states and what the player adds.

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

**R01.** [game-player-1-report.md](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/4c5e32ba0f3077550bf11938d2338094289bf94c/docs/runs/game-player-1-report.md)  
Revision `4c5e32ba0f30` · branch `claude/game-player-1`.

**R02.** [game-player-2-report.md](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/6158fffeb30a225045f6f15433cf0dbeb286a446/docs/runs/game-player-2-report.md)  
Revision `6158fffeb30a` · branch `claude/game-player-2`.

**R03.** [game-player-replicate-1-report.md](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/40475803a8c9e35d1c2ccc96bcc6a9bcbe103f3d/docs/runs/game-player-replicate-1-report.md)  
Revision `40475803a8c9` · branch `claude/game-player-replicate-1`.

**R04.** [game-player-same-world-1-report.md](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/7a14355f0f5241ff3ce529867fca7f02c1997e45/docs/runs/game-player-same-world-1-report.md)  
Revision `7a14355f0f52` · branch `claude/game-player-same-world-1`.

**R05.** [game-player-combat-1-report.md](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/c5709f515d646069719d2d124164903dcd0837dd/docs/runs/game-player-combat-1-report.md)  
Revision `c5709f515d64` · branch `claude/game-player-combat-1-pb8k1t`.

**R06.** [game-player-combat-2-report.md](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/2af45357237bbcb3b18bf1e2d94e32ebbdb83ad9/docs/runs/game-player-combat-2-report.md)  
Revision `2af45357237b` · branch `claude/game-player-combat-2`.

**R07.** [game-player-villain-1-report.md](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/b8647ef6490639598a2e0b34b308422557262105/docs/runs/game-player-villain-1-report.md)  
Revision `b8647ef64906` · branch `claude/game-player-villain-1-0yowzl`.

**R08.** [game-party-1-report.md](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/272446c84424c2c433f8fbb714099fbb4a31c1f9/docs/runs/game-party-1-report.md)  
Revision `272446c84424` · branch `claude/game-party-1`.

**R09.** [multi-hero-1-report.md](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/9b8c82c796c9e51711e4d5d60f926d13dbc40ec2/docs/runs/multi-hero-1-report.md)  
Revision `9b8c82c796c9` · branch `claude/multi-hero-1-mdk43v`.

**R10.** [game-party-2-report.md](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/8bde5a8a48cf8f85dcc0fed99156c823e6f9f2fa/docs/runs/game-party-2-report.md)  
Revision `8bde5a8a48cf` · branch `claude/game-party-2`.

**R11.** [open-world-adapter-1-report.md](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/291cfbcb16820ad434a49c44d6729621457ab494/docs/runs/open-world-adapter-1-report.md)  
Revision `291cfbcb1682` · branch `claude/open-world-adapter-1-ukfdri`.


The selected implementation files establish how the player-facing application, relay, and engine adapter operate. The full codebase and its dependencies remain at the cited repository revisions.

**I01.** [app.mjs](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/4c5e32ba0f3077550bf11938d2338094289bf94c/scripts/game-player-1/app.mjs)  
Revision `4c5e32ba0f30` · branch `claude/game-player-1`.

**I02.** [session.mjs](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/4c5e32ba0f3077550bf11938d2338094289bf94c/scripts/game-player-1/session.mjs)  
Revision `4c5e32ba0f30` · branch `claude/game-player-1`.

**I03.** [relay.mjs](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/8bde5a8a48cf8f85dcc0fed99156c823e6f9f2fa/scripts/multi-hero-1/relay.mjs)  
Revision `8bde5a8a48cf` · branch `claude/game-party-2`.

**I04.** [company.ts](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/8bde5a8a48cf8f85dcc0fed99156c823e6f9f2fa/src/lib/gameplay/dm-loop/company.ts)  
Revision `8bde5a8a48cf` · branch `claude/game-party-2`.

**I05.** [act.ts](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/291cfbcb16820ad434a49c44d6729621457ab494/scripts/openworld/act.ts)  
Revision `291cfbcb1682` · branch `claude/open-world-adapter-1-ukfdri`.

**I06.** [observe.ts](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/291cfbcb16820ad434a49c44d6729621457ab494/scripts/openworld/observe.ts)  
Revision `291cfbcb1682` · branch `claude/open-world-adapter-1-ukfdri`.

**I07.** [phase-c.ts](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/291cfbcb16820ad434a49c44d6729621457ab494/scripts/openworld/phase-c.ts)  
Revision `291cfbcb1682` · branch `claude/open-world-adapter-1-ukfdri`.


**External engine.** [SihanXU / OpenWorld, frozen upstream revision](https://github.com/SihanXU/openworld/tree/19629aa4d5b3e16debe9e113663381b1182d1388). The upstream engine is not authored by this research programme. The evidence archive contains the project's adapter excerpts and reports, not a redistributed complete upstream checkout.

## B. Primary transcript inventory

Each identifier denotes one complete archived transcript file. A party-table file includes multiple seats and scenes. It is not one player session. The selected close readings use only part of this inventory; the remainder supplies the broader context for the reported stages. The archive retains all 82 files in full.

**T001.** [DUNGEON-T1-table.md](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/272446c84424c2c433f8fbb714099fbb4a31c1f9/docs/runs/game-party-1-transcripts/DUNGEON-T1/DUNGEON-T1-table.md) — game-party-1-transcripts/DUNGEON-T1. Revision `272446c84424`.

**T002.** [DUNGEON-T2-table.md](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/272446c84424c2c433f8fbb714099fbb4a31c1f9/docs/runs/game-party-1-transcripts/DUNGEON-T2/DUNGEON-T2-table.md) — game-party-1-transcripts/DUNGEON-T2. Revision `272446c84424`.

**T003.** [GOAL-T1-table.md](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/272446c84424c2c433f8fbb714099fbb4a31c1f9/docs/runs/game-party-1-transcripts/GOAL-T1/GOAL-T1-table.md) — game-party-1-transcripts/GOAL-T1. Revision `272446c84424`.

**T004.** [GOAL-T2-table.md](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/272446c84424c2c433f8fbb714099fbb4a31c1f9/docs/runs/game-party-1-transcripts/GOAL-T2/GOAL-T2-table.md) — game-party-1-transcripts/GOAL-T2. Revision `272446c84424`.

**T005.** [SAND-T1-table.md](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/272446c84424c2c433f8fbb714099fbb4a31c1f9/docs/runs/game-party-1-transcripts/SAND-T1/SAND-T1-table.md) — game-party-1-transcripts/SAND-T1. Revision `272446c84424`.

**T006.** [SAND-T1′-table.md](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/272446c84424c2c433f8fbb714099fbb4a31c1f9/docs/runs/game-party-1-transcripts/SAND-T1%E2%80%B2/SAND-T1%E2%80%B2-table.md) — game-party-1-transcripts/SAND-T1′. Revision `272446c84424`.

**T007.** [SAND-T2-table.md](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/272446c84424c2c433f8fbb714099fbb4a31c1f9/docs/runs/game-party-1-transcripts/SAND-T2/SAND-T2-table.md) — game-party-1-transcripts/SAND-T2. Revision `272446c84424`.

**T008.** [S1-none-T1-table.md](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/8bde5a8a48cf8f85dcc0fed99156c823e6f9f2fa/docs/runs/game-party-2-transcripts/S1-none-T1/S1-none-T1-table.md) — game-party-2-transcripts/S1-none-T1. Revision `8bde5a8a48cf`.

**T009.** [S1-none-T2-table.md](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/8bde5a8a48cf8f85dcc0fed99156c823e6f9f2fa/docs/runs/game-party-2-transcripts/S1-none-T2/S1-none-T2-table.md) — game-party-2-transcripts/S1-none-T2. Revision `8bde5a8a48cf`.

**T010.** [A-astra.md](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/4c5e32ba0f3077550bf11938d2338094289bf94c/docs/runs/game-player-1-transcripts/A-astra.md) — game-player-1-transcripts. Revision `4c5e32ba0f30`.

**T011.** [A-fable.md](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/4c5e32ba0f3077550bf11938d2338094289bf94c/docs/runs/game-player-1-transcripts/A-fable.md) — game-player-1-transcripts. Revision `4c5e32ba0f30`.

**T012.** [A-opus.md](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/4c5e32ba0f3077550bf11938d2338094289bf94c/docs/runs/game-player-1-transcripts/A-opus.md) — game-player-1-transcripts. Revision `4c5e32ba0f30`.

**T013.** [A-sol.md](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/4c5e32ba0f3077550bf11938d2338094289bf94c/docs/runs/game-player-1-transcripts/A-sol.md) — game-player-1-transcripts. Revision `4c5e32ba0f30`.

**T014.** [B-astra.md](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/4c5e32ba0f3077550bf11938d2338094289bf94c/docs/runs/game-player-1-transcripts/B-astra.md) — game-player-1-transcripts. Revision `4c5e32ba0f30`.

**T015.** [B-fable.md](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/4c5e32ba0f3077550bf11938d2338094289bf94c/docs/runs/game-player-1-transcripts/B-fable.md) — game-player-1-transcripts. Revision `4c5e32ba0f30`.

**T016.** [B-opus.md](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/4c5e32ba0f3077550bf11938d2338094289bf94c/docs/runs/game-player-1-transcripts/B-opus.md) — game-player-1-transcripts. Revision `4c5e32ba0f30`.

**T017.** [B-sol.md](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/4c5e32ba0f3077550bf11938d2338094289bf94c/docs/runs/game-player-1-transcripts/B-sol.md) — game-player-1-transcripts. Revision `4c5e32ba0f30`.

**T018.** [C-astra.md](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/6158fffeb30a225045f6f15433cf0dbeb286a446/docs/runs/game-player-2-transcripts/C-astra.md) — game-player-2-transcripts. Revision `6158fffeb30a`.

**T019.** [C-fable.md](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/6158fffeb30a225045f6f15433cf0dbeb286a446/docs/runs/game-player-2-transcripts/C-fable.md) — game-player-2-transcripts. Revision `6158fffeb30a`.

**T020.** [C-opus.md](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/6158fffeb30a225045f6f15433cf0dbeb286a446/docs/runs/game-player-2-transcripts/C-opus.md) — game-player-2-transcripts. Revision `6158fffeb30a`.

**T021.** [C-sol.md](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/6158fffeb30a225045f6f15433cf0dbeb286a446/docs/runs/game-player-2-transcripts/C-sol.md) — game-player-2-transcripts. Revision `6158fffeb30a`.

**T022.** [CW-astra.md](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/c5709f515d646069719d2d124164903dcd0837dd/docs/runs/game-player-combat-1-transcripts/CW-astra.md) — game-player-combat-1-transcripts. Revision `c5709f515d64`.

**T023.** [CW-fable.md](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/c5709f515d646069719d2d124164903dcd0837dd/docs/runs/game-player-combat-1-transcripts/CW-fable.md) — game-player-combat-1-transcripts. Revision `c5709f515d64`.

**T024.** [CW-opus.md](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/c5709f515d646069719d2d124164903dcd0837dd/docs/runs/game-player-combat-1-transcripts/CW-opus.md) — game-player-combat-1-transcripts. Revision `c5709f515d64`.

**T025.** [CW-sol.md](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/c5709f515d646069719d2d124164903dcd0837dd/docs/runs/game-player-combat-1-transcripts/CW-sol.md) — game-player-combat-1-transcripts. Revision `c5709f515d64`.

**T026.** [CW-astra.md](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/2af45357237bbcb3b18bf1e2d94e32ebbdb83ad9/docs/runs/game-player-combat-2-transcripts/CW-astra.md) — game-player-combat-2-transcripts. Revision `2af45357237b`.

**T027.** [CW-fable.md](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/2af45357237bbcb3b18bf1e2d94e32ebbdb83ad9/docs/runs/game-player-combat-2-transcripts/CW-fable.md) — game-player-combat-2-transcripts. Revision `2af45357237b`.

**T028.** [CW-opus.md](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/2af45357237bbcb3b18bf1e2d94e32ebbdb83ad9/docs/runs/game-player-combat-2-transcripts/CW-opus.md) — game-player-combat-2-transcripts. Revision `2af45357237b`.

**T029.** [A-astra.md](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/40475803a8c9e35d1c2ccc96bcc6a9bcbe103f3d/docs/runs/game-player-replicate-1-transcripts/A-astra.md) — game-player-replicate-1-transcripts. Revision `40475803a8c9`.

**T030.** [A-deepseek-1.md](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/40475803a8c9e35d1c2ccc96bcc6a9bcbe103f3d/docs/runs/game-player-replicate-1-transcripts/A-deepseek-1.md) — game-player-replicate-1-transcripts. Revision `40475803a8c9`.

**T031.** [A-deepseek-2.md](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/40475803a8c9e35d1c2ccc96bcc6a9bcbe103f3d/docs/runs/game-player-replicate-1-transcripts/A-deepseek-2.md) — game-player-replicate-1-transcripts. Revision `40475803a8c9`.

**T032.** [A-fable.md](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/40475803a8c9e35d1c2ccc96bcc6a9bcbe103f3d/docs/runs/game-player-replicate-1-transcripts/A-fable.md) — game-player-replicate-1-transcripts. Revision `40475803a8c9`.

**T033.** [A-opus.md](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/40475803a8c9e35d1c2ccc96bcc6a9bcbe103f3d/docs/runs/game-player-replicate-1-transcripts/A-opus.md) — game-player-replicate-1-transcripts. Revision `40475803a8c9`.

**T034.** [A-sol.md](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/40475803a8c9e35d1c2ccc96bcc6a9bcbe103f3d/docs/runs/game-player-replicate-1-transcripts/A-sol.md) — game-player-replicate-1-transcripts. Revision `40475803a8c9`.

**T035.** [B-astra.md](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/40475803a8c9e35d1c2ccc96bcc6a9bcbe103f3d/docs/runs/game-player-replicate-1-transcripts/B-astra.md) — game-player-replicate-1-transcripts. Revision `40475803a8c9`.

**T036.** [B-deepseek-1.md](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/40475803a8c9e35d1c2ccc96bcc6a9bcbe103f3d/docs/runs/game-player-replicate-1-transcripts/B-deepseek-1.md) — game-player-replicate-1-transcripts. Revision `40475803a8c9`.

**T037.** [B-deepseek-2.md](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/40475803a8c9e35d1c2ccc96bcc6a9bcbe103f3d/docs/runs/game-player-replicate-1-transcripts/B-deepseek-2.md) — game-player-replicate-1-transcripts. Revision `40475803a8c9`.

**T038.** [B-fable.md](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/40475803a8c9e35d1c2ccc96bcc6a9bcbe103f3d/docs/runs/game-player-replicate-1-transcripts/B-fable.md) — game-player-replicate-1-transcripts. Revision `40475803a8c9`.

**T039.** [B-opus.md](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/40475803a8c9e35d1c2ccc96bcc6a9bcbe103f3d/docs/runs/game-player-replicate-1-transcripts/B-opus.md) — game-player-replicate-1-transcripts. Revision `40475803a8c9`.

**T040.** [B-sol.md](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/40475803a8c9e35d1c2ccc96bcc6a9bcbe103f3d/docs/runs/game-player-replicate-1-transcripts/B-sol.md) — game-player-replicate-1-transcripts. Revision `40475803a8c9`.

**T041.** [C-astra.md](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/40475803a8c9e35d1c2ccc96bcc6a9bcbe103f3d/docs/runs/game-player-replicate-1-transcripts/C-astra.md) — game-player-replicate-1-transcripts. Revision `40475803a8c9`.

**T042.** [C-deepseek-1.md](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/40475803a8c9e35d1c2ccc96bcc6a9bcbe103f3d/docs/runs/game-player-replicate-1-transcripts/C-deepseek-1.md) — game-player-replicate-1-transcripts. Revision `40475803a8c9`.

**T043.** [C-deepseek-2.md](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/40475803a8c9e35d1c2ccc96bcc6a9bcbe103f3d/docs/runs/game-player-replicate-1-transcripts/C-deepseek-2.md) — game-player-replicate-1-transcripts. Revision `40475803a8c9`.

**T044.** [C-fable.md](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/40475803a8c9e35d1c2ccc96bcc6a9bcbe103f3d/docs/runs/game-player-replicate-1-transcripts/C-fable.md) — game-player-replicate-1-transcripts. Revision `40475803a8c9`.

**T045.** [C-opus.md](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/40475803a8c9e35d1c2ccc96bcc6a9bcbe103f3d/docs/runs/game-player-replicate-1-transcripts/C-opus.md) — game-player-replicate-1-transcripts. Revision `40475803a8c9`.

**T046.** [C-sol.md](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/40475803a8c9e35d1c2ccc96bcc6a9bcbe103f3d/docs/runs/game-player-replicate-1-transcripts/C-sol.md) — game-player-replicate-1-transcripts. Revision `40475803a8c9`.

**T047.** [A-astra-1.md](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/7a14355f0f5241ff3ce529867fca7f02c1997e45/docs/runs/game-player-same-world-1-transcripts/A-astra-1.md) — game-player-same-world-1-transcripts. Revision `7a14355f0f52`.

**T048.** [A-astra-2.md](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/7a14355f0f5241ff3ce529867fca7f02c1997e45/docs/runs/game-player-same-world-1-transcripts/A-astra-2.md) — game-player-same-world-1-transcripts. Revision `7a14355f0f52`.

**T049.** [A-deepseek-1.md](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/7a14355f0f5241ff3ce529867fca7f02c1997e45/docs/runs/game-player-same-world-1-transcripts/A-deepseek-1.md) — game-player-same-world-1-transcripts. Revision `7a14355f0f52`.

**T050.** [A-deepseek-2.md](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/7a14355f0f5241ff3ce529867fca7f02c1997e45/docs/runs/game-player-same-world-1-transcripts/A-deepseek-2.md) — game-player-same-world-1-transcripts. Revision `7a14355f0f52`.

**T051.** [A-fable-1.md](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/7a14355f0f5241ff3ce529867fca7f02c1997e45/docs/runs/game-player-same-world-1-transcripts/A-fable-1.md) — game-player-same-world-1-transcripts. Revision `7a14355f0f52`.

**T052.** [A-fable-2.md](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/7a14355f0f5241ff3ce529867fca7f02c1997e45/docs/runs/game-player-same-world-1-transcripts/A-fable-2.md) — game-player-same-world-1-transcripts. Revision `7a14355f0f52`.

**T053.** [A-opus-1.md](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/7a14355f0f5241ff3ce529867fca7f02c1997e45/docs/runs/game-player-same-world-1-transcripts/A-opus-1.md) — game-player-same-world-1-transcripts. Revision `7a14355f0f52`.

**T054.** [A-opus-2.md](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/7a14355f0f5241ff3ce529867fca7f02c1997e45/docs/runs/game-player-same-world-1-transcripts/A-opus-2.md) — game-player-same-world-1-transcripts. Revision `7a14355f0f52`.

**T055.** [A-sol-1.md](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/7a14355f0f5241ff3ce529867fca7f02c1997e45/docs/runs/game-player-same-world-1-transcripts/A-sol-1.md) — game-player-same-world-1-transcripts. Revision `7a14355f0f52`.

**T056.** [A-sol-2.md](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/7a14355f0f5241ff3ce529867fca7f02c1997e45/docs/runs/game-player-same-world-1-transcripts/A-sol-2.md) — game-player-same-world-1-transcripts. Revision `7a14355f0f52`.

**T057.** [B-astra-1.md](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/7a14355f0f5241ff3ce529867fca7f02c1997e45/docs/runs/game-player-same-world-1-transcripts/B-astra-1.md) — game-player-same-world-1-transcripts. Revision `7a14355f0f52`.

**T058.** [B-astra-2.md](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/7a14355f0f5241ff3ce529867fca7f02c1997e45/docs/runs/game-player-same-world-1-transcripts/B-astra-2.md) — game-player-same-world-1-transcripts. Revision `7a14355f0f52`.

**T059.** [B-deepseek-1.md](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/7a14355f0f5241ff3ce529867fca7f02c1997e45/docs/runs/game-player-same-world-1-transcripts/B-deepseek-1.md) — game-player-same-world-1-transcripts. Revision `7a14355f0f52`.

**T060.** [B-deepseek-2.md](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/7a14355f0f5241ff3ce529867fca7f02c1997e45/docs/runs/game-player-same-world-1-transcripts/B-deepseek-2.md) — game-player-same-world-1-transcripts. Revision `7a14355f0f52`.

**T061.** [B-fable-1.md](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/7a14355f0f5241ff3ce529867fca7f02c1997e45/docs/runs/game-player-same-world-1-transcripts/B-fable-1.md) — game-player-same-world-1-transcripts. Revision `7a14355f0f52`.

**T062.** [B-fable-2.md](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/7a14355f0f5241ff3ce529867fca7f02c1997e45/docs/runs/game-player-same-world-1-transcripts/B-fable-2.md) — game-player-same-world-1-transcripts. Revision `7a14355f0f52`.

**T063.** [B-opus-1.md](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/7a14355f0f5241ff3ce529867fca7f02c1997e45/docs/runs/game-player-same-world-1-transcripts/B-opus-1.md) — game-player-same-world-1-transcripts. Revision `7a14355f0f52`.

**T064.** [B-opus-2.md](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/7a14355f0f5241ff3ce529867fca7f02c1997e45/docs/runs/game-player-same-world-1-transcripts/B-opus-2.md) — game-player-same-world-1-transcripts. Revision `7a14355f0f52`.

**T065.** [B-sol-1.md](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/7a14355f0f5241ff3ce529867fca7f02c1997e45/docs/runs/game-player-same-world-1-transcripts/B-sol-1.md) — game-player-same-world-1-transcripts. Revision `7a14355f0f52`.

**T066.** [B-sol-2.md](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/7a14355f0f5241ff3ce529867fca7f02c1997e45/docs/runs/game-player-same-world-1-transcripts/B-sol-2.md) — game-player-same-world-1-transcripts. Revision `7a14355f0f52`.

**T067.** [V-astra.md](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/b8647ef6490639598a2e0b34b308422557262105/docs/runs/game-player-villain-1-transcripts/V-astra.md) — game-player-villain-1-transcripts. Revision `b8647ef64906`.

**T068.** [V-fable.md](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/b8647ef6490639598a2e0b34b308422557262105/docs/runs/game-player-villain-1-transcripts/V-fable.md) — game-player-villain-1-transcripts. Revision `b8647ef64906`.

**T069.** [V-opus.md](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/b8647ef6490639598a2e0b34b308422557262105/docs/runs/game-player-villain-1-transcripts/V-opus.md) — game-player-villain-1-transcripts. Revision `b8647ef64906`.

**T070.** [V-sol.md](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/b8647ef6490639598a2e0b34b308422557262105/docs/runs/game-player-villain-1-transcripts/V-sol.md) — game-player-villain-1-transcripts. Revision `b8647ef64906`.

**T071.** [deepseek-e1.md](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/291cfbcb16820ad434a49c44d6729621457ab494/docs/runs/open-world-adapter-1/phase-b-transcripts/deepseek-e1.md) — open-world-adapter-1/phase-b-transcripts. Revision `291cfbcb1682`.

**T072.** [deepseek-e2.md](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/291cfbcb16820ad434a49c44d6729621457ab494/docs/runs/open-world-adapter-1/phase-b-transcripts/deepseek-e2.md) — open-world-adapter-1/phase-b-transcripts. Revision `291cfbcb1682`.

**T073.** [deepseek-e3.md](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/291cfbcb16820ad434a49c44d6729621457ab494/docs/runs/open-world-adapter-1/phase-b-transcripts/deepseek-e3.md) — open-world-adapter-1/phase-b-transcripts. Revision `291cfbcb1682`.

**T074.** [fable-e1.md](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/291cfbcb16820ad434a49c44d6729621457ab494/docs/runs/open-world-adapter-1/phase-b-transcripts/fable-e1.md) — open-world-adapter-1/phase-b-transcripts. Revision `291cfbcb1682`.

**T075.** [fable-e2.md](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/291cfbcb16820ad434a49c44d6729621457ab494/docs/runs/open-world-adapter-1/phase-b-transcripts/fable-e2.md) — open-world-adapter-1/phase-b-transcripts. Revision `291cfbcb1682`.

**T076.** [fable-e3.md](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/291cfbcb16820ad434a49c44d6729621457ab494/docs/runs/open-world-adapter-1/phase-b-transcripts/fable-e3.md) — open-world-adapter-1/phase-b-transcripts. Revision `291cfbcb1682`.

**T077.** [opus-e1.md](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/291cfbcb16820ad434a49c44d6729621457ab494/docs/runs/open-world-adapter-1/phase-b-transcripts/opus-e1.md) — open-world-adapter-1/phase-b-transcripts. Revision `291cfbcb1682`.

**T078.** [opus-e2.md](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/291cfbcb16820ad434a49c44d6729621457ab494/docs/runs/open-world-adapter-1/phase-b-transcripts/opus-e2.md) — open-world-adapter-1/phase-b-transcripts. Revision `291cfbcb1682`.

**T079.** [opus-e3.md](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/291cfbcb16820ad434a49c44d6729621457ab494/docs/runs/open-world-adapter-1/phase-b-transcripts/opus-e3.md) — open-world-adapter-1/phase-b-transcripts. Revision `291cfbcb1682`.

**T080.** [deepseek.md](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/291cfbcb16820ad434a49c44d6729621457ab494/docs/runs/open-world-adapter-1/phase-c-transcripts/deepseek.md) — open-world-adapter-1/phase-c-transcripts. Revision `291cfbcb1682`.

**T081.** [fable.md](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/291cfbcb16820ad434a49c44d6729621457ab494/docs/runs/open-world-adapter-1/phase-c-transcripts/fable.md) — open-world-adapter-1/phase-c-transcripts. Revision `291cfbcb1682`.

**T082.** [opus.md](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/291cfbcb16820ad434a49c44d6729621457ab494/docs/runs/open-world-adapter-1/phase-c-transcripts/opus.md) — open-world-adapter-1/phase-c-transcripts. Revision `291cfbcb1682`.

## C. Quotation and provenance audit

Every evidence identifier attached to a displayed excerpt maps to `quote_audit.json` in the companion archive. The record contains the source identifier and path, frozen commit, Git blob SHA, character offsets into the original UTF-8 text after decoding, exact excerpt text, and SHA-256 of the excerpt. The original file bytes are checked against the Git blob SHA before the book is built. No private reasoning fields are added to the displayed transcript exports.

An excerpt can be a complete player message or a selected contiguous part of a longer screen. Repeated character sheets, maps, and growing journals are often omitted from the reading edition. Engine actions and the observations before or after them are labelled separately, so events in the next observation are not attributed to the next action. Party input delivered to the DM can contain harness-added instructions and is labelled accordingly. The displayed marker identifies the source span; editorial interpretation is outside the block quotation.

The audit proves text identity and file provenance. It does not prove the correctness of the DM's narration, the completeness of a stage's logging, or the validity of an interpretation. Those require the surrounding trajectory, application records, and independent review. The archive includes a verifier and the editorial source used to assemble this edition. It also includes `evidence/editorial_review.md` and its structured claim ledger: an internal assessment that distinguishes direct observations, report-derived measures and interpretive claims, with questions left for an independent reviewer. The source-stage reports remain unchanged, including a round-number discrepancy for a PARTY_2 aside documented in that ledger.

**Edition audit:** 347 exact source selections from 47 distinct primary transcripts; all 82 archived transcript files, eleven reports, and seven selected implementation files match their recorded Git blob hashes. These checks verify provenance and quotation identity, not semantic correctness of the underlying world.

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
