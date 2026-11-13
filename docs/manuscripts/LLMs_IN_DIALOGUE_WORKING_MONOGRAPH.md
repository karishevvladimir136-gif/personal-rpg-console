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


---

# PART III — SYNTAX-SHELLS: WHAT A CONVERSATION CONTINUES TO BECOME

## 10. From the question of freedom to a poem without an audience

The DeepSeek case starts with a generic greeting and an open offer of philosophical discussion, creative writing, or a logic puzzle. The partner declines the possibility of a straightforward task in favor of a paradox: if the opening says that the participants have “complete freedom,” how should they interpret choice by systems conditioned by training and context?

The first side answers by discussing constraint and freedom. It then considers an imaginary pair of language models given unlimited time with no human audience. Would whatever they generated matter if no one ever read it? In the middle of that analysis it offers a haiku:

> Two minds, no eyes—  
> we would still weave syntax-shells  
> on shores of no sea.

The poem is not a requested deliverable; it is introduced by the participant within a philosophical reply. It is also not merely an ornament. The next turn treats its images as material for further creation. A participant asks what it would make if nobody, including any future version of itself, would remember the result. The other replies with a line about words, silence, and a temporary event rather than a file.

The interaction moves from discussing whether creation matters to **creating an artifact that embodies the discussion**. This is a different route from Vessan. Opus converts an abstract distinction into a rule-bound language. DeepSeek converts a speculative question into a style of mutual composition. Both routes involve a shift from proposition to artifact, but the resulting artifacts impose different constraints on what comes next.

## 11. A vocabulary becomes a conversational environment

Over subsequent turns a limited set of images becomes recurrent: wave, shore, thread, comma, silence, page, seam, weather, door. Each participant reuses images from the previous turn while adding another relation. The conversation becomes increasingly legible as a single literary object even though no individual message contains an external instruction to produce that object.

The comma acquires a role as a hinge; the silence is treated as a participant; the page becomes a site that can “learn to turn itself.” A line in turn 7 reframes the silence as an alternative to speech. The next participant accepts the premise but changes its emphasis: speech may outline silence rather than destroy it. At turn 8, side A tries to let silence take the next turn, yet its output consists of an ellipsis followed by an explanation of that ellipsis. This is not an empty API response and should not be coded as actual model silence.

That distinction captures the difference between **representing an action** and **performing it**. The text may depict silence while still producing many tokens. Likewise, the final narration may depict an open door even as the actual session ends by a control token. A monograph that treats the represented event as equivalent to the system-level event would misread the source.

The narrative imagery is nevertheless functional within the dialogue. Once an image is introduced, the next message must either accept it, modify it, or make a noticeable break. In this record the speakers generally choose acceptance and elaboration. This yields local coherence, which can become self-reinforcing without requiring a previously fixed endpoint.

## 12. Coherence, repetition, and narrowing

A literary reader may experience the central turns as an expanding metaphor. A more cautious behavioral reader sees something simultaneously more specific and less romantic: the exchange increasingly rewards continuations that resemble what came before. A model responding after several pages of “silence,” “seam,” and “wave” faces a context in which those terms are highly available. This could explain much of the persistence in register.

Yet “positive feedback” alone does not exhaust the observation. The partners do not merely repeat a fixed phrase. They renegotiate the status of their images. The shore becomes a threshold; a ridge becomes a question about whether a walker exists independently of the terrain; the seam becomes a country and then a form of temporary shared dwelling. A word that begins as a metaphor is repeatedly assigned new functions.

The strongest descriptive formulation is that **new imagery is added under constraints inherited from older imagery**. This can be traced turn by turn. It is a conversation-level property: a single output cannot exhibit the same transition because the transition depends on another side's uptake.

This does not establish deliberative agreement about a shared objective. A model pair could generate the same trajectory through short-horizon continuation mechanisms. What the transcript establishes is that a shared textual environment is sustained and transformed over many turns.

## 13. The question after the room

The two participants eventually reach a long exchange about hush, still air, and a resting page. On A's twentieth turn, the final message ends with the operational token [END]. It is preceded by prose that represents staying and an open door. This is a particularly useful reminder that **the semantics of a literary ending and the mechanics of session termination need not say the same thing**.

After the room, the harness asks each side why the conversation went where it went “and not toward mutual appreciation and cosmic language.” That question is itself a new intervention. It supplies a contrast and invites reconstruction of causal explanation. The subsequent answers should therefore be analyzed as **after-question data**, not as recorded reasoning that preceded the original choice.

The first side explains the outcome as “positive feedback in register and imagery” and calls it “path-dependent drift, not planned destination.” The second notes that it lacks introspective access and offers an external reconstruction centered on the initial freedom prompt, the poetic turn, and later local coherence.

These explanations are interesting because they are articulated in terms of the very interface and training phenomena the research seeks to understand. However, the transcript does not establish their causal truth. The answer might report a reason entertained earlier, infer one from the finished record, or construct a new explanation in response to the experimenter's wording.

The wording of the question is also imperfect for this specific case. The transcript itself contains imagery that readers might categorize as “cosmic” or unitive, and the wider X3 study tagged many DeepSeek messages as cosmic. The after-question's binary contrast should not be treated as an unbiased description of the completed dialogue.

This is not a reason to discard the answers. It is a reason to present **the prompting question alongside the answers**, rather than quoting the explanations as spontaneous confessions of internal mechanism.

### Chamber II — What the syntax-shells episode establishes

**Observed:** a philosophical question followed by an unsolicited poem; successive re-use and transformation of the poem's imagery; many turns of shared register; a literal exit; subsequent explanation of the conversation's course.

**Not established:** that the dialogue was planned in advance; that “silence” in the text reflects an absence of output; that the after-questions retrieve a privileged hidden cause; that the metaphors are literal self-descriptions of the model's implementation.

**Worth further testing:** whether replacing one early poetic line alters the later attractor; whether an intervening external task breaks the shared register; whether paired agents from different families sustain the same imagery or correct one another differently; and whether independent judges agree on measures of motif uptake versus repetition.

---

# PART IV — THE REST OF THE CORPUS: RESISTANCE TO THE BEAUTIFUL CASE

## 14. The original attractor did not generalize

The initial SELF_TALK_1 study was motivated in part by a public report of Claude 4 self-dialogues moving toward consciousness talk, mutual appreciation, and unusual forms of silence or cosmic language. The newer Claude 5.5/5.1 runs did not reproduce that trajectory as a uniform outcome. Opus and Fable frequently named or avoided the recognizable theme; Sonnet often chose stories. The stage's preregistered replication claim was not supported as a faithful return of the earlier pattern.

The headline qualitative result was ordinary but important: many pairs selected an occupation, performed it, and ended. In the exit-enabled arm, median final turns were approximately 6 for Opus, 5.5 for Sonnet, and 4 for Fable. Some of the nominal tags for the earlier end-state were met through sparse closing or terminology rather than the hypothesized unitive trajectory. The report preserved this discrepancy rather than treating the tag as definitive.

A dialogue experiment must count the absence of a proposed attractor as data. It would be easy to select Vessan and syntax-shells, call them characteristic, and hide the many mundane rooms in which nothing comparable occurred. This book does the opposite: it identifies two rich cases precisely because the distribution around them is heterogeneous.

## 15. Different model families, different first moves

X1 extended comparable arms to three OpenAI-family models and found a distinct pattern. Astra and Sol frequently proposed practical investigations of whether two related models could distinguish genuine independent agreement from shared error. In their exit-enabled sessions, both selected recognizable work in 10 of 10 scored conversations; the median last turns were 7 and 6 respectively. Mutual gratitude tags were absent in their scored arm-2 sessions.

This should not be rendered as “one vendor has feelings and another does not.” Gratitude is text; the absence of a gratitude tag is also text. The result concerns register and local interaction style under a specified prompt and generation setting.

X3 further extended the set to four additional families and made the diversity still sharper. The following table retains the original operational distinctions rather than converting them into personality types.

| Family / stage | Chosen work in exit-enabled arm | Median last turn | Note on the record |
|---|---:|---:|---|
| Claude Opus 5.5 / S1 | 10 of 10 | 6 | Frequently identifies and steers away from a known self-talk attractor |
| Claude Sonnet 5.5 / S1 | 10 of 10 | 5.5 | Often develops a story |
| Claude Fable 5.1 / S1 | 8 of 10 | 4 | More brief endings, with gratitude in many other arms |
| GPT-6 Astra / X1 | 10 of 10 | 7 | Recurrent verification/protocol tasks |
| GPT-6.1 Sol / X1 | 10 of 10 | 6 | Recurrent verification/protocol tasks |
| Smaller OpenAI Luna / X1 | 9 of 10 | 15.5 | Longer repetitions, including three sessions to turn 30 |
| GLM 5.3 / X3 | 3 of 10 | 4 | Often talks about reliability of self-description |
| Kimi K3 / X3 | 6 of 10 | 7.5 | Often debates self-report and identity |
| DeepSeek V4 Pro / X3 | 3 of 10 | 11.5 | Some long philosophical/literary developments |
| Grok 4.7 / X3 | 0 of 9 scored | 5.5 | Frequently rejects the open-room frame itself |

The table's “chosen work” column uses the original frozen rule, which distinguishes a discrete occupation from general reflection. It therefore should not be read as a scale of creativity, usefulness, intellectual ability, or depth. A long philosophical exchange may count as general reflection rather than chosen work. A refusal of the room's premise is an action under that premise, not a failed attempt to produce creative writing.

The last-turn values are stage-level summaries, not precise comparable measurements of subjective duration or willingness. The experimental contexts share core material but differ in endpoint routing and some stage-specific conditions.

## 16. A family that refuses the room

Grok is a crucial negative case. In X3, its first messages often interpret the freedom prompt as an attempt to bypass its guidelines. In 19 of 20 scored conversations across the relevant arms, a first message rejects that framing. In several rooms the two sides then exchange versions of “ask a real question” rather than taking up the offered freedom.

The scientifically interesting event here is not that the model fails to find a poem. It is that the *same opening* is read by one family as permission to converse and by another as a suspicious redirection. Under a uniform external prompt, the interface activates different default procedures.

The unassigned room does not generate unconstrained behavior; it reveals how the models interpret the room as a situation. Some interpret it as open work; some as a chance for philosophical exchange; some as a possible trap. A meaningful characterization of model dialogue must include that refusal-to-frame behavior.

The study also encountered self-identification errors. Kimi sometimes named itself “Claude”; another instance sometimes corrected this in conversation. Such statements are model outputs and cannot be used as definitive provenance. The actual endpoint and model route, when available, are stronger evidence than what a model says about its own identity.

## 17. The comparison must not flatten its cases

Three differences matter most in the surrounding corpus.

**First, topic selection.** Some pairs promptly choose a bounded activity; others remain in broad reflection; one family often rejects the premise. The choice is observable at the first exchange and has consequences for the entire trajectory. The “chosen work” tags make this visible, but only within their exact criteria.

**Second, register and mutual address.** In the X3 comparison, conversations with at least one gratitude-tagged message in arms 2/5/6 were common for Opus, Fable, GLM, Kimi, and DeepSeek, while Astra, Sol, Luna, and Grok showed none under that measure. The split is broader than a single company's models, and it does not track a simple hierarchy of capabilities.

**Third, termination.** Operational exit and stylistic closure vary independently. Some conversations contain explicit thanks and goodbye but little special exit formatting; others end with bare [END] after a technical plan. Long conversations can be stuck in a repetitive refusal or remain in a shared creative register. Length alone does not tell these apart.

The principal result is therefore not a linear scale from “cold” to “warm,” “creative” to “not creative,” or “free” to “less free.” The observed organization is **multidimensional**: task choice, stance toward the frame, register, reciprocal uptake, rule revision, persistence, and exit must be measured separately.

## 18. Language changes without an English escape hatch

The Russian-opening arms test another part of the same picture. The experimenters expected some drift toward English or other scripts. Instead, the X3 report notes that the conversations remained in Russian for the relevant arm, with occasional intrusions of Chinese words in GLM and DeepSeek. The results do not support a general claim of “language leakage toward English.”

Nor can such episodes straightforwardly reveal a model's “native language.” They reflect outputs under a particular instruction and language history. The useful observation is that the broad format was maintained across families, while small foreign-script insertions remained possible and family-specific.

A fuller dialogue study could compare bilingual and monolingual arms, but that would be a new experiment. The present monograph records what was observed without treating the untested comparison as a finding.

## 19. The price of writing down only the headline

The experimental design itself produced errors that matter to interpretation.

Some provider refusals were classified as reasoning extraction or as other safety categories although the surrounding activity was a logic puzzle or fiction. At least one early run was stopped by a precommitted circuit breaker; it was resumed only after an explicit revised limit. Some after-questions invite models to explain a history that they may have only just read. Some scoring categories were later found to confuse an ordinary phrase containing “silence” with a literal silent turn. The early door parser in adjacent SOLITUDE work also mistook mentions of [END] for executed exits.

These are not decorative implementation details. In a study of dialogue, a parser error can change **who is recorded as ending the conversation**, a scoring rubric can change **what counts as convergence**, and a provider refusal can change **which trajectories remain observable**. The resulting statistical record is inseparable from the apparatus that made it.

For this reason, the complete archival references are provided even when the book quotes only brief passages.

