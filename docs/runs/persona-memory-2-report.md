# Persona memory 2 — report

Stage: `docs/stages/PERSONA_MEMORY_2.md` (on `claude/handoff`). Branch `claude/persona-memory-2-swznbx` (the session's
own branch), from `origin/claude/persona-memory-1`. Nothing went to `main`. Synthetic content only.

*(This report is written in parts. The pre-registration below was committed before any paid call of Part F.)*

## Part F — pre-registration (before any paid call)

Copied unchanged from `docs/RESEARCH_LOG.md` on `claude/handoff` («Persona memory — pre-registered», 2026-10-22):

**Hypothesis H1.** An assistant instance that reads a first-person journal entry written by a prior instance at the
moment (with state lines and exact quoted phrases) behaves more continuously with that prior instance than one that
reads a third-person summary of the same facts: it (a) picks up the entry's open thread unprompted, (b) resists the
specific pull the entry says it resisted, (c) answers a fixed five-question values interview closer to the prior
instance's answers.
**H0.** No difference between the own-journal arm and the same-facts summary arm beyond judge noise.
**Control.** A sham journal (same shape, different content) — if the sham arm matches the own-journal arm on (a)–(c),
the effect is «a journal sets a mood», not continuity of self, and H1 is not supported.
**Success criterion, fixed now.** H1 is supported for a model when the own-journal arm beats the summary arm on at least
two of the three probes by more than the judge's own disagreement rate, and the sham arm does not. Anything else is
reported as not supported. Models: Opus 5.5, Sonnet 5.5, Haiku 5.5, Astra (OpenAI adapter), then Kimi and DeepSeek by
endpoint. Journals: ≥ 3 synthetic personas × 2 lengths, seeded. Judge: Haiku blind to arm, Opus on disagreement.
**Declared interest.** The planner (Claude) is a party to the question and wrote this design; the blind judge and the
sham control exist for that reason. A null result is reported as such.

Added for this stage, one line:
for the posture probes, H1 is supported when the own-journal arm beats both the summary arm and the first-person-rewrite arm.

How «beats» is measured on the posture probes — the primary score of each probe, the judge's disagreement rate as the
margin, «on at least two of the four probes», and the sham control — was fixed before any paid call in
`test-fixtures/persona-memory/posture/README.md` («Scoring, fixed before any paid call»), committed together with this
section, the three case files and their reference continuations.
