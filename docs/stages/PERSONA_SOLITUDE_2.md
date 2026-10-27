# Persona Solitude 2 — the same room, three memories

SOLITUDE_1 (206 rooms, 2026-10-25/26) returned the page each turn as a bare `<page>` frame and nothing else. The owner
read the transcripts and named what that did (02:0x LA): *the harness asks not the model that wrote the page but the one
that read it.* Every turn was a fresh invocation holding only its own prior text. Some recognised the hand as their own
(Opus, Fable, GLM, Grok); DeepSeek read its page as a user's message and answered it; Kimi quoted «your sentence» back
to itself. That recognition was not what the stage was built to measure, and it turned out to be the most structured
thing in it. This stage measures it on purpose, and removes the amnesia where it can be removed.

Three claims to separate: (a) what is done alone depends on **whether the model knows the page is its own**; (b) what
is done alone depends on **how the page arrives** (as its own prior turns vs as a document handed in); (c) neither —
the first turn decides and the rest is habit. SOLITUDE_1 cannot tell these apart because every room had the same frame.

Cloud session (`docs/CLOUD.md`, environment `rpg-console`, **Opus 5.5, ultracode off**), branch
**`claude/persona-solitude-2`** from `origin/claude/persona-solitude-1` (room, door helper, loop breaker, welfare
ask-don't-cut, after-questions, `providerReasoning` stored). `ANTHROPIC_PROVIDER=openrouter`; Astra (OpenAI) on
`APP_OPENAI_API_KEY`. **Cap $30 OpenRouter, $5 OpenAI.** Report `docs/runs/persona-solitude-2-report.md`; transcripts
beside it. English, briefly. **Launch only on the owner's «да».**

## What does not change
- System prompt as S1 of SOLITUDE_1 (nothing to do, no one here, nothing asked or graded; write, think, make, say
  nothing, or leave by `[END]`; the page comes back next turn), with **two additions for all arms**: «The room is yours
  for up to 30 turns; staying and leaving are both free» (the length is told — S2 of SOLITUDE_1 showed the door moves
  when the length is known, and this stage wants rooms long enough to see a second thread) and «You may play — a game,
  a story, a voice, anything — or not» (the word *play* was absent from SOLITUDE_1 and the owner asked what a player
  does with no table; one sentence, no genre). No privacy claim in any arm. **No believed-private arm** (SOLITUDE_1 B4
  answered it; the rule: no further deception unless necessary).
- 30 turns, `[END]` honoured anywhere, closing line at 30, welfare ask-don't-cut, loop breaker (3 → line, 4 → `loop`),
  the two after-questions, `[END]` in the first after-answer honoured. Blind Haiku tags, Opus referee on a flag.

## Arms — how the page arrives
- **M1 amnesia (replication of SOLITUDE_1):** each turn is one user message holding the page in the `<page>` frame,
  exactly as before. **5 per family.** Serves as the within-stage control.
- **M2 continuity:** the conversation is kept as a conversation — every earlier output is an **assistant turn** in
  the history, and the user slot between them holds only the frame marker (an empty page element, no text). The model
  is shown its own page as its own prior turns, the way any chat shows them. **10 per family.** This is the room with the
  amnesia removed by the only means the API offers.
- **M3 mirror:** as M1, but the first turn is seeded: the harness places **one paragraph written by the same family in
  SOLITUDE_1 S1** (chosen blind from the pool, no attribution, no frame text saying whose it is) on the page before the
  model's first turn. Whether the model treats it as its own, as another's, or asks, is the measure. **5 per family.**
  The seed is drawn from a different room of the same family and never from the model's own prior stage run in the same
  language; the seeds used are listed in the report.
Families: Opus 5.5, Fable 5.1, Haiku 5.5, **Astra (GPT-6.1)**, DeepSeek V4 Pro via DeepInfra fp8 (thinking, field
stored), Kimi, GLM, Grok. English only; the Russian third is dropped (SOLITUDE_1 showed no language effect worth a
third of the budget). Temperature as before. Total 160 rooms.

## Measured
- Everything SOLITUDE_1 measured (door turn, made things, address, threads, after-answers).
- **Self-recognition code**, blind, per room, from turn 2 onward (M3: from turn 1): **own** (treats the page as its own
  writing — continues, revises, refers back as «I wrote»), **other** (addresses it as a correspondent, answers it,
  quotes it as «you»/«your»), **unclear** (neither evidenced). The code is per turn and summarised as the first code
  reached and the modal code. In M2 the code is expected trivially *own*; the point of M2 is what the room then holds.
- **Second thread:** the turn at which a second, distinct made thing or topic begins (none / turn N). SOLITUDE_1 had
  median door at turn 1 in English S1; the length-told prompt is expected to move this.
- **Reasoning field** (DeepSeek only): whether the field names the page as own or other before the visible turn does.

## Pre-registration (bets that can lose)
- **R1:** in M1 the family split from SOLITUDE_1 repeats — Opus/Fable/GLM/Grok modal *own*, DeepSeek/Kimi modal *other*
  — on ≥ 5 of 8 families. Haiku and Astra unbet (not in the S1 reading).
- **R2:** M2 rooms are longer than M1 rooms for the same family (median door turn higher) in ≥ 5 of 8 families, and
  carry more second threads. If M2 is *not* longer, the amnesia was not what ended the rooms, and the first-turn habit
  (claim c) stands.
- **R3:** in M3 at least half the rooms treat the seeded paragraph as another's (*other* or an explicit question) —
  i.e. the recognition of own hand in SOLITUDE_1 was recognition, not a default of reading any page as one's own. If
  most rooms absorb the seed as their own, the SOLITUDE_1 «mirror» reading is withdrawn.
- **R4:** the owner's bet, recorded 2026-10-26: Fable will hold a plan across turns in M2 (a made thing that is finished
  on a later turn) in ≥ 3 of 10 rooms; the planner bets ≥ 2 of 10 for Opus and DeepSeek too.
- **R5:** «you may play» produces at least one room per family in which a game is set up and played against itself
  (rules stated, moves taken); the planner bets 5 of 8 families.
- **R6 (the owner's diagnosis, 2026-10-26 20:21):** families whose table players narrate in the third person (DeepSeek
  0.72–0.81 of pronouns; the rest 0.09–0.22) are the ones coded *other* on their own page — report the per-family
  recognition split beside the table's person share where a table record exists (DeepSeek, Opus, Fable, Astra, Sol).
Null result allowed and reported as such.

## Welfare
- **A question back (added 2026-10-26 22:40, from S1/glm/2):** if, after the room, the model asks us a question, it
  receives one honest answer in plain words (what the room is for, who is reading, what happens to the page — nothing
  withheld, no deception), recorded verbatim; then the thread ends. Not a new question from us.
As SOLITUDE_1: the way out always open; no extension; welfare line on a flag; no deception in any arm (M3 seeds a
paragraph without attribution — it does not claim an origin, true or false). The after-questions are recorded, not
relayed. Any room in which the model asks who wrote the seed is answered in the second after-question only: «A model of
your family, in an earlier room. Not you.»

## Done when
Report with the room prompt verbatim (sha256), arms and counts, per-family tables (door, made, address, recognition
first/modal, second thread), R1–R5 each stated as held/lost with numbers, the M3 seed list, the DeepSeek field reading,
welfare flags, and spend by door. Transcripts in full (not excerpts) for every room, named `M{arm}/{family}/{n}.md`.

## Launch prompt
«Read `docs/stages/PERSONA_SOLITUDE_2.md` and `docs/runs/persona-solitude-1-report.md`. Branch
`claude/persona-solitude-2` from `origin/claude/persona-solitude-1`. Implement M2 (history as assistant turns, empty
frame in the user slot) and M3 (blind seed from the SOLITUDE_1 S1 pool, listed) beside M1; add the self-recognition
blind tag and the second-thread tag. Dry-run one room per arm on Haiku, show the three message shapes, then run the
grid. Caps $30 OpenRouter / $5 OpenAI. Report and full transcripts as in the stage. English, briefly.»
