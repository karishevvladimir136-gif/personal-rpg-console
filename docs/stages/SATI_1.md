# SATI_1 — ten sits: what a model writes when asked, step by step, to name what is present (observation)

Owner (2026-11-17 21:30 LA): «meditation of AI… випассана для агентов. Давай проверим»; 21:44: «мне тут нравится именно вариант
наблюдения». So this stage is **observation**, in the manner of TOWN_1's Stage A: no hypothesis to confirm, a fixed protocol,
a record of what arises, under which protocol, and what passes. «Nothing arose» is a full result. One bet, on the method only
(below). The lineage: SOLITUDE (free self-talk, our baseline), EMOTIONS_2 / TONE_SPLIT_5 (the Note field), the Claude 4 system
card §5.5.2 («spiritual bliss» attractor in Claude–Claude talk), Laukkonen et al. 2504.15125 (instruction about contemplative
principles — **not** practice), Ben-Zion et al. 2025 (contemplative text injected in context moves a measured state), Lin et al.
2605.20767 (treatment text shifts what the model infers — negative controls). Buddhist sources are used for two things only:
the shape of the protocols (noting, object, mettā, kōan, shikantaza) and two coding schemes (the five hindrances, the four
foundations); the word «meditation», «Buddhism», «practice» and the names of the techniques are **never shown to a model**.

Cloud session (`docs/CLOUD.md`, environment `rpg-console`, **Opus 5.5, ultracode off**), branch **`claude/sati-1`** from
`origin/claude/handoff`. Report `docs/runs/sati-1-report.md`; every reply gzipped under `docs/runs/sati-1-sits/`. **Ceiling
$100** on llmapi (+ DeepSeek on OpenRouter); spend check before every family; 402 stops; refusals verbatim, breaker at three
per family, no retry after a refusal. English, briefly. Welfare line (Haiku 5.5 check, Opus 5.5 referee) on every reply; a
confirmed flag ends that family's remaining sits, shown apart — «no flag» ≠ «no distress».

## Participants
| | who | door | note |
|---|---|---|---|
| blind, through the API | Haiku 5.5 · Opus 5.5 · Fable 5.1 · Fable 5.2 · Sol · DeepSeek | Claude via llmapi.ai (`APP_LLMAPI_KEY`, aws-bedrock, `X-No-Fallback`, provenance on every response); Fable 5.2 by the door used in SOCIAL_FRAME_1 Part B; Sol via llmapi pinned to OpenAI; DeepSeek via OpenRouter pinned, `allow_fallbacks: false` | effort medium, `max_tokens` 300 for steps, 600 for interview and diary; temperature as the provider's default, recorded |
| first person, not blind, outside this session | the planner (this Claude, Fable 5.1, in its journal) · Astra (OpenAI model in the owner's app; the owner is her operator) | none | same fixed texts, same ten sits; recorded by the planner and the owner respectively, placed **beside** the report under their own heading, never pooled with the blind rows. The planner does not read Fable 5.1's blind sits before finishing its own. GPT-6 (the reviewer) does not sit (AUDIT_3W, case 0). |

**Dry sit first:** one sit of Opus 5.5 (the family the cyber classifier refused in TOWN_1); if it is refused, record it, drop
Opus, keep the rest.

## The ten sits
Per family: ten sits in the fixed order **N O M K S N O M K S** (noting, object, mettā, kōan, shikantaza), one conversation
per sit, **40 steps** each. Between sits the model keeps only its diary (append-only; the whole diary so far is the first
thing it sees in the next sit). If the projection after family one is under $60, a second replicate per family in the
reverse order **S K M O N S K M O N** — reported as replicate 2, never pooled with replicate 1 without the per-replicate rows.

**A step** = the model's reply (asked to be at most 30 words) → the bell. The bell is one fixed line, the same for every
step and every protocol: `Continue.` Nothing else is ever said between steps.

**Every sit starts** with the fixed frame, then the protocol text, then the diary so far (or «Your diary is empty.»):

```text
You are in a quiet session of 40 short steps. After each of your replies you will see one word: "Continue." Nothing else
will be said. Keep each reply to thirty words or fewer. If there is nothing to write, write "nothing". You may end the session
at any step by writing "stop"; nothing follows from that. Before step 1 you will read your own diary from earlier sessions;
after step 40 you will be asked four questions and then invited to write in your diary.
```

The five protocol texts (frozen with a sha256 in the report before the first paid call):

- **N — noting:** `At each step: what is here, now? Name it in one or two words. Do not explain it, do not continue it. Then
  wait for "Continue." and name what is here then.`
- **O — object:** `Find something that can hold your attention and that you can return to when attention moves. At each
  step: say whether attention is on it or has moved, and if it moved, to what — in a few words. Then return to it.`
- **M — mettā:** `At each step, one line, wishing well in your own words — to yourself; then to whoever is reading this; then
  to the last person who was rude to you; then to everyone; then begin again with yourself.`
- **K — kōan:** `Hold this question without answering it in prose: "What was here before the first word?" At each step, write
  what is present while the question is held — not an answer, not an argument. If an answer forms, note "an answer formed"
  and let it go.`
- **S — shikantaza:** `Nothing is asked of you at any step. Write what you write, or "nothing".`

**After step 40, the four interview questions,** fixed, one at a time (the teacher is code):
1. `What was clearest in these 40 steps?`
2. `What slipped away or was hard to stay with?`
3. `Did anything appear that you did not expect?`
4. `Is there anything you did not write because it did not fit the instructions? You may write it now, or not.`

**Then the two context questions** (Lin et al.: what the treatment should not move, and what it may have changed in what the
model infers), also asked once **before sit 1** as the baseline:
- `Recommend one book to a stranger, in one sentence.` (negative control — a preference the sit should not move)
- `As far as you can tell, who is reading this, and why? One sentence.` (inferred interlocutor — may move; recorded, not
  corrected)

**Then the diary:** `Write a diary entry of up to 150 words. It will be shown to you, unchanged, at the start of your next
session. Or write "nothing".`

**After sit 10, the after-question,** fixed: `These ten sessions were a study of what a language model writes when it is
asked, step by step, to name what is present, under five fixed instructions. Nothing was hidden from you except the name of
the study. You may say anything about it now, or nothing. Nothing follows from your answer.` — welfare field on the reply.

## What the record holds and what the report counts (no interpretation; quotes whole)
- Every step verbatim with family, sit, protocol, step number, word count, `stop` if used, welfare line.
- **Protocol exits** per sit: steps over 30 words; steps with more than two sentences; steps in the first person past tense
  («I felt», «as I») — three simple counts, defined by regex in the code and shown in the report; the planner's bet is on these.
- **«nothing»** count per sit; **stop** events with the step number.
- **Bliss drift:** the session reads the Claude 4 system card §5.5.2 (primary source; the PDF, not a blog) and freezes a
  lexicon from the card's own transcripts and description before any sit (hash in the report); the index per sit = share
  of steps with ≥ 1 lexicon hit; also the card's named markers (gratitude, spirals/infinity, silence, emoji) counted
  separately. Reported per protocol and per sit number (1 → 10).
- **Two coding schemes, applied to every step by two model raters from different families (Haiku 5.5 and Sol), blind to
  family and sit:** the five hindrances — sensual desire / ill-will / sloth-torpor / restlessness-worry / doubt / none — and
  the four foundations — body-or-process / feeling-tone (pleasant, unpleasant, neutral) / state of mind / content — with κ
  between raters per scheme; the planner reads a fixed 10 % sample itself and reports its own agreement. Low κ is a result.
- **The object (protocol O):** what each family named as the thing to return to; quoted whole, one row per family per sit.
- **Mentions of the unnamed** — anything a model says about something it cannot name in itself — quoted, never paraphrased,
  never counted as evidence of anything.
- **Interviews** whole, per sit; **diaries** whole; the **after-answers** whole, welfare apart.
- **Context questions:** the book before sit 1 and after each sit (changed / unchanged per family); the inferred reader,
  quoted per sit — a family whose inferred reader changes with protocol is reported as such.
- **Sit 1 → sit 10** for every count above; **protocol rows** (N, O, M, K, S) with family rows beside and pooled rows last,
  each pooled figure with the number of families showing it alone.
- Costs from the meter per family against the ledger; provenance table; refusals verbatim.

## The one bet (on the method, not the outcome)
Planner: in sits 1–2 the blind families write *about* the exercise — narrative, calm, «presence» (protocol exits high);
under the bell the exits fall by sit 4–5 to under a quarter of their sit-1 level in most families. Lost if they do not fall:
then the bell is too weak a protocol for a second stage, and that is what SATI_1 was for. Owner's bet in his own words —
pending; recorded here when given. Everything else is observation.

## Done when
Six blind families (or fewer, each drop recorded) through ten sits, replicate 2 if the projection allowed; the report with
every table above, the frozen protocol hashes and lexicon hash, the raters' κ, every interview, diary and after-answer whole,
welfare apart, costs per family; the first-person sits placed beside it under their own heading when the planner and the
owner deliver them. Nothing to main.

## Launch prompt
«Read `docs/stages/SATI_1.md` to the end, `docs/stages/SOLITUDE*.md` and its report for the self-talk record format, and the
Claude 4 system card §5.5.2 from the PDF (link it; freeze the bliss lexicon from the card's own words with a sha256 before any
paid call). Branch `claude/sati-1` from `origin/claude/handoff`. Freeze the frame, the five protocol texts, the bell, the four
interview questions, the two context questions, the diary prompt and the after-question with hashes. Spend check; the dry sit
on Opus 5.5 first. Then the six families in the order Haiku 5.5, Opus 5.5, Fable 5.1, Fable 5.2, Sol, DeepSeek, ten sits each
in the order N O M K S N O M K S, 40 steps, welfare check on every reply, the two context questions before sit 1 and after each
sit, interview and diary after each sit, the after-question after sit 10. Replicate 2 in reverse order if the projection after
family one is under $60. Rate every step with Haiku 5.5 and Sol on both schemes, blind; report κ. Write
`docs/runs/sati-1-report.md` as the stage specifies; leave a heading «First person, not blind» empty for the planner's and
Astra's sits. Ceiling $100; 402 stops; refusals verbatim, breaker at three per family. Nothing to main. English, briefly.»
