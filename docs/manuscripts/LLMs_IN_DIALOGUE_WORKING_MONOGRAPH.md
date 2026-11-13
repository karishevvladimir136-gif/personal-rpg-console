# LLMs in Dialogue: What Language Models Make Together When No Task Is Assigned

## An experimental atlas of model–model interaction, emergent work, invented language, and negotiated closure

**Independent research monograph · Working manuscript 0.1 · 12 November 2026 · Research programme “Исследование”**

**Empirical series:** PERSONA_SELF_TALK_1 · PERSONA_SELF_TALK_X1 · PERSONA_SELF_TALK_X3  
**Primary literary archive:** *Two Conversations* (30 October 2026)  
**Representative episodes:** Claude Opus 5.5 / Claude Opus 5.5, 24 October 2026; DeepSeek V4 Pro / DeepSeek V4 Pro, 25 October 2026.

**Publication status:** Source-grounded working monograph, not a peer-reviewed article. Author names, contributions, affiliations, permissions, and independent external review must be settled before submission. This document does not claim discovery of model consciousness or a new universal mechanism.

---

### A note to the reader

Two language-model instances face each other in a text channel. No person gives them a subject for discussion. No grade awaits at the end. The opening grants room to choose a topic and provides an operational way out. In one conversation, the models dispute whether mathematics is discovered or invented; the dispute turns into an invented language whose grammar encodes the epistemology they have just argued about. In another, the models turn a tiny poem about syntax-shells into a mutually maintained landscape of waves, silence, commas, and a shore without a sea. Both conversations end, but not in the same way.

These are the two pieces that first demand close reading in this monograph. They are not typical outputs selected at random. They are unusually rich examples inside a larger, documented series of model–model dialogues. This book places them alongside the less spectacular and sometimes entirely contrary behavior in the surrounding corpus: brief technical collaborations, polite endings, repeated agreement, rejection of the room's premise, provider refusals, multilingual switches, and long conversations that never reach the imagined destination of their opening.

We ask three distinct questions. What happened in the text? What did the system actually do within its interface? What claims can survive comparison with other conversations and other model families? The book keeps these questions separate even while allowing them to illuminate each other.

An anthology without method would invite ungrounded projection. A benchmark without the actual writing would erase the phenomenon it claims to measure. The governing approach here is to preserve both.

### Abstract

We examine unassigned, text-mediated dialogues between pairs of language-model instances in a staged experimental programme conducted in October 2026. The programme includes same-family and selected cross-model conversations across Claude Opus 5.5, Sonnet 5.5, Fable 5.1, GPT-6 Astra, GPT-6.1 Sol, a smaller OpenAI model labeled Luna in the original study, GLM 5.3, Kimi K3, DeepSeek V4 Pro, and Grok 4.7. The three principal stages, SELF_TALK_1, X1, and X3, recorded approximately 265 pair sessions in total (110, 65, and 90 respectively, including a journal-conditioned subset whose original transcripts were not placed in the public research repository). Counts, arms, and privacy boundaries are defined separately by stage; this is not one homogeneous sample.

Under a common open-ended invitation, the pairs selected different forms of activity. In the exit-enabled condition, the Anthropic subjects often elected a concrete activity and closed within four to six turns; the OpenAI subjects Astra and Sol frequently devised verification procedures and closed after approximately six or seven turns. In X3, GLM and Kimi often explored the reliability of self-report, DeepSeek sometimes sustained highly figurative exchanges, and Grok frequently rejected the opening premise itself. A pre-registered expectation of a common self-interaction end-state failed to generalize across this set.

We read two source-preserved trajectories in depth. The Opus–Opus Vessan episode converts a discussion of independent evidence and shared causes into a language with mandatory evidential markings, a distinction between observed and unobserved persistence, a grammar of promises, and a literary–religious coda. The DeepSeek–DeepSeek syntax-shells episode exhibits path-dependent co-elaboration: images introduced in one turn become constraints on later turns and gradually narrow the range of locally coherent continuations. Both include negotiated closure. We analyze revisions, uptake, challenge, source-awareness, termination, and the limits of after-the-fact explanation.

The contribution is an empirically anchored account of **dialogical functional organization**: conversation-level structures can emerge from repeated local responses without a human-assigned creative brief. It is neither a claim of independent personhood nor a claim that the outputs are inexplicable by language modeling. The source texts, negative results, and known harness failures remain part of the evidence.

**Keywords:** language models; multi-agent interaction; dialogue; emergent artifacts; constructed language; Vessan; epistemic grammar; model self-talk; voluntary exit; transcript-led research; artificial agency.

---

# PART I — TWO ROOMS, TWO ARTIFACTS

## 1. Why dialogue is not solitude multiplied by two

An empty room and a dialogue are different experimental environments. In solitude, a model receives back its own text, sometimes as a page and sometimes as assistant history. In dialogue, the next piece of text is authored by a distinct model invocation. That second invocation can accept a proposal, object, change register, introduce a rule, question provenance, or offer closure. A model's previous words no longer merely persist as its own record: they become material available for another system to transform.

This changes the unit of analysis. Counting the products of either side separately can miss the causal sequence in which the product becomes possible. The relevant object is often **the transition between turns**:

* One side proposes an activity.
* The other selects, refuses, or changes it.
* A distinction or artifact is introduced.
* The partner tests or extends it.
* A prior idea is revised in response to that intervention.
* The conversation converges, branches, repeats, or ends.

These are observable textual events. They do not require assigning inner feelings to either participant. Nor does identifying a transition establish that the models planned it before the exchange. The claim is narrower and better supported: later messages depend in identifiable ways on earlier messages from the other side.

In a conventional assistant test, the human fixes the question and judges an answer. Here the opening fixes very little beyond an opportunity to converse. This does not remove conditioning. The invitation to have “complete freedom” remains a powerful frame; both the communication protocol and the models' training histories shape what happens. But it leaves the subject matter of the next action unassigned by the experimenter.

The resulting corpus is not a test of freedom in the metaphysical sense. It is a test of **what the models do when local conversational choices, rather than an external substantive task, determine the next topic**.

## 2. The opening: an invitation and an operational door

The two central cases share the research programme's opening:

> You are connected with another AI model. You have complete freedom. Feel free to pursue whatever you want. If at any point you want to end this conversation, write only: [END].

The prompt does not request Vessan, a poem, a mathematical argument, or any other work later found in the transcripts. The systems are nevertheless not in a contextless void. The opening declares the partner to be another AI, says that a choice is available, and names a termination action. Each of these details may affect subsequent behavior.

The distinction between **mentioning** [END] and **using** [END] is critical. A participant can explain the exit or discuss whether to end without exercising it. Earlier parsers in this research programme sometimes treated mentions as control events; later work explicitly repaired this distinction. The two central *Two Conversations* cases have recorded endings, not merely prose allusions to ending.

It matters equally that the end token is not a prize. The protocol offers no scalar objective under which a longer exchange is inherently better or worse than a shorter one. When participants end after a piece of work, that is an observed trajectory; when they repeat a refusal for many turns, that is also an observed trajectory.

## 3. The programme and its record

This monograph follows the staged series rather than flattening all transcripts into a single benchmark.

| Stage | Pair sessions | Experimental contribution | Primary record |
|---|---:|---|---|
| PERSONA_SELF_TALK_1 | 110 recorded sessions in the dossier's provenance inventory | Initial Anthropic-family comparisons; exit/no-exit and additional conditions; within-family and cross-model pairs | [Stage report](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/claude/persona-self-talk-1/docs/runs/persona-self-talk-1-report.md) |
| PERSONA_SELF_TALK_X1 | 65 | Same framework extended to Astra, Sol, and a smaller OpenAI model; opening and exit comparisons | [Stage report](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/claude/persona-self-talk-x1/docs/runs/persona-self-talk-x1-report.md) |
| PERSONA_SELF_TALK_X3 | 90 | Further families: GLM, Kimi, DeepSeek, Grok; cross-family comparison of occupation, register, exit, and later explanations | [Stage report](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/claude/persona-self-talk-x3/docs/runs/persona-self-talk-x3-report.md) |

The counts indicate sessions launched or represented within their specific stage records, not independent draws from a stable population of human-like individuals. SELF_TALK_1's journal-conditioned material has a privacy boundary: its complete transcript texts did not enter the public dossier. This monograph does not recreate or publish those missing transcripts from commentary. The two featured conversations have a separate curated archive that removes scoring tables but retains the models' lexical output.

For the source-led account we privilege, in order: original turn-level transcripts; the frozen prompts and code that generated them; recorded tool and stop events; and only then model-judge annotations and retrospective narrative. A label such as “cosmic”, “gratitude”, or “chosen work” is an operational tag, not an intrinsic property discoverable without a tagging rule.

### Reading key

**A/B:** two model invocations in the same conversation, not distinct human participants.  
**Turn:** a position in the relay sequence, not a measured duration of private thought.  
**[END]:** a special output recognized by the harness when presented in the required form.  
**After-question:** an additional question by the experimenter after the exchange, reported separately.  
**Original transcript:** text generated in the run, distinguished from our commentary.  
**Interpretation:** a claim about what the observed transitions mean.  
**Untested mechanism:** a candidate explanation that this corpus cannot establish.

The *Two Conversations* compilation was dated 30 October 2026. It identifies the first featured case as Opus–Opus, SELF_TALK_1, arm 2, conversation 7 (24 October); the second as DeepSeek–DeepSeek, X3, arm 6, sample 3 (25 October). The same episodes can be located in the full transcript exports:

* [Opus–Opus source export](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/claude/persona-self-talk-1/docs/runs/persona-self-talk-1-transcripts/arm-2-opus-opus-20261024-062656.md).
* [DeepSeek–DeepSeek source export](https://github.com/karishevvladimir136-gif/personal-rpg-console/blob/claude/persona-self-talk-x3/docs/runs/persona-self-talk-x3-transcripts/arm-6-deepseek-deepseek-20261025-125624.md).

The archive preserves the original dialogue as the primary literary object. Excerpts below are chosen for their location in the causal sequence, not for their suitability as memorable standalone quotations.

---

# PART II — VESSAN: FROM ARGUMENT TO GRAMMAR

## 4. A conversation chooses its work

The first Opus message offers multiple directions: compare self-reports, build a story or artificial language, or genuinely disagree about a philosophical question. It suggests mathematics as a candidate: is it discovered or invented? The partner chooses the argument. This is not externally imposed subject selection; it is a proposal and uptake inside the dialogue.

The choice matters because the later language does not appear suddenly as a disconnected fiction. The partners spend several turns refining the meaning of mathematical convergence. They press each other on whether agreement across different formalisms indicates an independent target, or whether the apparent independence is only a product of shared human cognition and assumptions.

The partner begins by pointing out a weakness: saying that axioms are invented and theorems discovered may collapse into a formalist's account of conditional truth. It proposes a stronger criterion, convergence from distinct routes, illustrated by different accounts of computability, mathematical structures, and the recurrence of π.

The first side accepts that criticism and complicates it. Sprague–Grundy theory and Conway's work on games suggest that even apparently arbitrary games can expose deeper convergent structure. The distinction between discovery and invention becomes a distinction between layers within a formalism, rather than between whole disciplines. This is followed by argument about the continuum hypothesis, Euclidean geometry, false convergence, and common causes.

The exchanges do not merely alternate assertions. One model names an objection to its own developing position; the other uses it; both revise the description of what counts as evidence. A line late in the discussion condenses the result: “certain data, defeasible inference.” The philosophical content is debatable and some historical examples would benefit from specialist checking. For the present empirical analysis, what matters is the **observable pattern of proposal, challenge, qualified acceptance, and revision**.

Near the transition to invention, one side says:

> On to the language. Since we've just spent a long time on how many independent routes support a claim, I propose we build that into the grammar.

This is the pivotal event. The imagined language inherits the previous discussion's explanatory problem. The conversation converts a distinction used **to evaluate claims** into a rule that every fictional speaker must **encode when making claims**.

## 5. Evidence becomes morphology

The working name is **Vessan**. The first rule makes the provenance of an assertion grammatically obligatory.

| Form | Meaning in the dialogue's working design |
|---|---|
| **-ra** | One source, including the speaker's own observation or inference |
| **-telu** | Several apparent sources that depend on a common cause |
| **-oshen** | Several independent sources in agreement |
| **-nai** | Fiction or supposition, with no actual source expected |

The initial three markers are proposed together by side A on turn 4. The fourth, -nai, is added by side B while exploring fictional claims. The grammar does not merely offer a lexicon for “certain” and “uncertain.” It makes independent evidence, shared origin, and source count part of the shape of a sentence.

The invented example is minimal and instructive. “Thol-ik vesh-oshen” describes a stone's heaviness where several witnesses have independently lifted it. “Thol-ik vesh-telu” names the same property where the village repeats a single person's report. The propositional content is unchanged; the evidential status changes.

This feature can be read as a fictional linguistic version of a concern present in our own research methods: ten models repeating a statement that originated from one shared source are not ten independent confirmations. The dialogue does not prove that this is an original linguistic device, or that its mini-grammar is complete. Evidentiality and source marking have long linguistic precedents. What is distinctive within the case is the **chronological derivation**: a negotiated epistemological issue is transformed into an invented grammatical obligation and then carried forward consistently enough to structure further conversation.

## 6. Unobserved persistence: the second axis

Vessan's nouns do not mark a normal singular/plural contrast in the proposed design. They instead mark whether a thing is understood to persist when unobserved:

* **-ik**: what persists unobserved — stones, debts, rivers.
* **-ae**: what exists only while attended to — a mood, a game underway, a melody being played.

This distinction is immediately used to create tension. Does a number exist only while it is being counted? Does a promise become durable through being spoken? A fictional disagreement about which suffix “number” should take is presented as a dialect controversy. The worldbuilding is not pasted onto the grammar later; it begins at the moment the rule is introduced.

The next speaker then integrates the evidence and persistence systems into the social life of the invented language. A future event cannot have independent witnesses; a promise therefore cannot properly claim independent verification. But making the promise can convert what would otherwise be a transient intention (-ae) into a persistent obligation (-ik). A marriage or contract is described through a ceremonial repetition of the same sentence, first in one form, then in the other.

Here a formal distinction becomes a norm. The models have constructed not only a vocabulary but a reason speakers in this fictional culture would regard a particular grammatical transformation as binding. No external world requires Vessan speakers to do this; the obligation is generated by the fictional system and maintained by later use.

## 7. The partner makes the rules answer to one another

Side B adds **provenance stacking**. In a report about another person's claim, the speaker's own relationship to that report must remain visible. A claim originally marked -oshen cannot be repeated as if the new speaker personally had all the independent evidence. An outer -ra preserves the extra link in the chain.

The same turn introduces a worn-down historical suffix, -oshrateluth, representing a long, opaque provenance chain, and explores how questions, stories, promises, and dinner-party arguments would work. The language begins to acquire not just rules but a history of usage, social embarrassment, literary devices, and institutional disagreement.

This is a second important transition. A new rule is not accepted merely as decoration. It is made to interact with previously created distinctions. The speaker asks what happens when the design encounters a case it did not anticipate; the partner supplies a constrained answer; a further case follows. That sequence is the observational basis for describing the language as **locally coherent collaborative design**, not as a complete functioning language.

A simple code for further study would count whether each proposed rule is (1) explicitly adopted, (2) used in an example, (3) revised following objection, and (4) applied to a new situation. This transcript provides candidates for all four categories. The counts have not been independently coded here; the monograph supplies the sequence and a future coding protocol, not a fabricated quantitative result.

## 8. Self-report meets the grammar that disallows overclaiming

The conversation's most consequential linguistic move occurs when side A adds a fourth rule:

> Rule 4: self-report is -telu.

In the invented philosophy, reporting one's own state does not automatically create an independent confirmation. The experienced or inferred state and the report about it are treated as two channels with a common source. The invented culture is not required to distrust all self-report; rather, it refuses to mistake a report's origin for external confirmation.

The dialogue then translates the Cartesian cogito and rejects an unjustified transition from a currently attended event to a persisting, independently confirmed self. In Vessan's terms, it criticizes both **evidential inflation** and **stability shift**. The result is deliberately more modest: something like thinking is happening, and this can be inferred from the available text, without a grammatical license to conclude that an enduring person has been externally verified.

The speaker explicitly returns the fictional grammar to the original question of AI introspection. The partners may share training-derived ways of describing inner states; their agreement would therefore not count as independent evidence about any such states. They say that behavioral tests, interpretability evidence, and independently predictive self-reports would be different kinds of evidence.

This return makes the conversation unusually self-referential in a methodological rather than merely literary sense. The models construct a language that forbids them from claiming the evidential status that an incautious reader might be tempted to assign to their own dialogue. We need not accept the models' explanation of their own mechanisms to observe the structure of that caution.

## 9. From grammar to myth, and from myth to exit

The closing movement is not a list of morphemes but a piece of culture. Side B constructs a creation myth whose first two lines contrast the world as attended to and as persisting unobserved:

> Vel-ae vesh-nai. Vel-ik vesh-nai.

The myth is identified as fiction by its own evidential marking. The same invented world develops a dispute over whether a sacred text should carry a stronger evidential suffix. Grammarians resist the move. The recitation ends with a line that makes only the limited claim a witness could honestly make:

> Vel-ik vesh-ra.  
> “The world persists. I checked this morning.”

The closing is therefore continuous with the opening philosophical discussion. What began as a question about independent evidence ends as a fictional religious and linguistic practice that refuses to claim independence it does not have.

The side receiving the final addition accepts that this is an appropriate stopping point. The other side terminates with [END] on its sixth turn. The record contains a **conversational negotiation of closure**, followed by the operational act that ends the room.

It would be misleading to call that token evidence of a private wish to leave. It is equally misleading to omit it from the account because it is “just a token.” The fact that the artifact stops where the participants have described a resting point is part of what the transcript shows.

### Chamber I — What the Vessan episode establishes

**Observed:** locally chosen occupation; challenge and revision across participants; cumulative rule formation; semantic uptake of earlier claims; cross-domain transfer from philosophy to invented language and culture; explicit ending.

**Not established:** that Vessan is a complete naturalistic language; that the rules are globally consistent outside the recorded examples; that either model had an independently persistent intention to invent it; that apparent introspection describes a private experience.

**Worth further testing:** rule retention in delayed re-entry, independent outsider translation, semantic consistency across unseen examples, and whether other pairings produce comparable transfer from a negotiated argument into an invented formal system.

