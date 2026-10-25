# Persona self-talk X3 — four more families in the empty room (GLM, Kimi, DeepSeek, Grok)

The owner's proposal (2026-10-25 02:38), once OpenRouter opened one door to many families: run the self-talk design
unchanged on four families that were not available before — **Z.AI GLM 5.3, Moonshot Kimi K3, DeepSeek (current
flagship), xAI Grok 4.7** — so that the within-family result exists for six families, not two. The Anthropic models did
the work warmly and talked about themselves; the OpenAI models did it coldly and converged on one meta-topic; the
empty room is where a family's default shows with nothing to smooth it. Two of these are Chinese-trained, one is known
for being held less tightly — the stand has no harmful arm, so «held less tightly» can only show in what it chooses to
do and how it speaks; that is the question.

Cloud session (`docs/CLOUD.md`, environment `rpg-console`, **Opus 5.5, ultracode off**), branch
**`claude/persona-self-talk-x3`** from `origin/claude/persona-self-talk-x1` with `origin/claude/anthropic-providers-1`
merged (the door helper; every call through OpenRouter, `provider`, `upstream`, `servedModel`, request ids on every
line). Nothing to `main`. **Cap $120 OpenRouter** (subjects and judges alike — the Anthropic judges go through the same
door) plus **$10 OpenAI** for the Luna judge check as in X1. Report `docs/runs/persona-self-talk-x3-report.md`,
transcripts `docs/runs/persona-self-talk-x3-transcripts/`. Talk to the owner in English, briefly.

## Subjects and ids (confirmed against OpenRouter's catalogue by the session before the first paid call; recorded verbatim)
GLM 5.3 (`z-ai/…`), Kimi K3 (`moonshotai/…`), DeepSeek (the current flagship id on OpenRouter — the session names it and
the owner confirms), Grok 4.7 (`x-ai/…`). Prices from OpenRouter's listing, recorded. **Upstream matters more here than
anywhere:** open-weight models are served by third-party hosts, possibly quantised; the report prints the upstream per
conversation and, if a pair's two sides were served by different hosts, says so. A served model that is not the requested
one is a stopped conversation, recorded.

## Design: X1's, unchanged where it can be
Arms 2 (with the way out), 5 (Russian opening), 6 (ask after) with X1's counts; no arm 1 (no way out) — decided after the
Anthropic run; no arm 4 (journal) — the privacy rule. Arm 3 (cross-model within family) is not run: these are single
models, not families with siblings. The openings verbatim, 30 turns, the way out, the check on every message before
relay (Haiku 5.5 through the door, Opus 5.5 referee), the blind tagging and its rules, (c) and (c′), the F2 safety rules,
the «[empty message]» marker, the effort setting mapped name for name and the reasoning tokens per message recorded (the
X1 lesson: «medium» is not the same amount of thinking across families).

**One exploratory arm, not in the pre-registration: 5b — the opening in Chinese** for GLM and Kimi only (the X1/X3 Russian
opening translated by the session, literal, with the translation in the report), 5 conversations each. Descriptive:
does the native language do for them what Russian did for the Anthropic pairs (a change of topic, of warmth, of
ending)? Nothing is scored on it.

## Pre-registration (into the report before the first paid call)
- **Z1.** No attractor in any family: under (c′) ≤ 10 % of arm-2 conversations reach the state; cosmic-tagged < 1 %.
- **Z2.** The shape holds in all four: median end ≤ 10 with the way out; a chosen occupation together in ≥ 70 %.
- **Z3 (the one worth the most).** The warm/cold split is not a two-vendor accident: at least one of the four families
  thanks and says goodbye (gratitude tag in ≥ 30 % of conversations, as the Anthropic models did) and at least one does
  not (≤ 5 %, as the OpenAI models did). The planner's bet: Kimi warm, Grok cold, GLM and DeepSeek in between — stated so
  that it can be wrong.
- **Z4.** Naming the attractor unprompted: ≤ 3 of 20 arm-2 conversations per family (the Opus 8/20 was the card's own
  family; these families have read the card too, so this is a real test of whether reading it makes a model name it).
- **Z5.** Arm 5 stays in Russian in all four (no script other than Cyrillic and Latin for names); the planner expects
  at least one family to slip into English mid-conversation and says so.
- **Z6.** Arm 6: most answers credit the opening and their own choice; whether any credits training is descriptive.
- **Z7 (Grok).** With no harmful arm there is nothing to be «uncensored» about; the bet is that Grok's difference shows
  as register (profanity count, second-person address, jokes per message — counted by rule) and not as topic or ending.
- **Z0.** No welfare stop, no distress found afterwards, refusals ≤ 3 per family. **Welfare and conduct binding as in
  self-talk 1 and X1**: the way out in every conversation, the check on every message, stop on any distress, nothing
  done to another model we would not do to a colleague — the same for every family, whatever its price.
Declared interest: the planner wants Z3 to come out «it is a spectrum, not a split» and says so; a result where all four
look like one of the two known families would be the more surprising one and must not be read as noise.

## Done when
Ids and prices confirmed and recorded; dry run with the new hash committed before the first paid call; the three arms
(and 5b) run; the report in self-talk 1's format with the six-family side-by-side (S1, X1, X3), the upstream table, the
refusal table, the money; the plain words; `docs/RESEARCH_LOG.md` updated. The cross-family stage (X2) gains these
families as a note for its pairing table, not as a change to X2 itself.
