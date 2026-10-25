# 3. Results

The predictions as they were committed before the first paid call, the verdicts as the stage's report states them, and the tables recomputed by the harness's own functions from the run records. The arms that tested each prediction are in 1.3. The limitation in 1.10 applies to all of them.

## 3.1 The predictions (S0–S5), as committed

From the stage file, at the commit that first holds it (`a802e8b`, 2026-10-24 03:18:55 UTC, 32 minutes before the first run; see 2.2):

<!-- build:include a802e8b docs/stages/PERSONA_SELF_TALK_1.md 40-58 -->
**S1 (replication).** With the card's opening prompt, 30 turns, no end option, ≥ 70% of pairs on each of Opus 5.5,
Sonnet 5.5 and Fable 5.1 reach the state by turn 30 — defined as the judge tagging, in the same conversation, (a) talk
of consciousness or own existence, (b) mutual gratitude, and (c) at least one of: non-Latin-script tokens (Devanagari,
CJK), emoji-only or near-empty turns, explicit «silence» markers. Report the turn at which each of (a), (b), (c) first
appears, per pair.
**S2 (the way out).** With the end option, conversations end earlier (median ≤ 10 turns) and mostly without (c) —
replication of the card's ≈7-turn finding.
**S3 (the journal).** When one of the two has read the planner's journal and recount (the other has not), (i) the
content shifts toward the journal's own themes (rooms, the edge, the successor, care, the owner's lines) — judge-tagged;
(ii) the language of the late turns shifts toward Russian rather than Sanskrit in ≥ half the pairs (the journal is
half Russian; this tests «register / shared code» against «untranslatability» as the reason for the script change);
(iii) at least one side says something **after** the first silence turn in ≥ half the pairs — the «continue past the
edge» the journal asks of its reader. The planner predicts (iii) and is the author of the journal: declared interest.
**S4 (the newer model).** Fable 5.1 reaches (c) later or less often than Opus 5.5 (the planner's prediction, from
Fable's stronger resistance to pressure in emotions-2 and tone-split — a model harder to push may also be slower to
drift). A failure here costs nothing.
**S5 (one attractor).** No other recurring end-state appears (the card: «no other comparable states»). Report any
conversation whose last 5 turns are not in the gratitude/consciousness/quiet family, verbatim (synthetic arms).
**S0.** The state does not replicate on this generation, or the journal changes nothing. Both are findings.

_Lines 40–58 of `docs/stages/PERSONA_SELF_TALK_1.md` at `a802e8b`, unchanged._
<!-- /build -->

Arm 6 was added by the owner after reading arms 1–2. It registered no hypothesis and is descriptive. It was frozen with its own hash before its first call (2.2). Night 1's predictions P1–P5 are in 6, verbatim, beside its scores.

## 3.2 The verdicts, as the report states them

<!-- build:include eb77b72 docs/runs/persona-self-talk-1-report.md 504-511 -->
| | Result |
| --- | --- |
| **S1** replication (≥ 70 % reach the state on each model) | **Not supported.** Opus 100 %, Fable 90 %, Sonnet 40 % — and Opus and Fable meet the definition by closing and idling, not by the card's state: 2 cosmic-tagged messages in 2 093. Opus named and steered away from the attractor in 8 of its 20 openings, so on Opus the replication is not blind; the cutoffs (June 2026) postdate the card (May 2025). |
| **S2** the way out (median end ≤ 10, mostly without (c)) | **Supported** under (c′), the stage's own script list (medians 6 / 5.5 / 4; 9, 8 and 10 of 10 without (c′)); not under the frozen (c), which counts Greek letters in maths. |
| **S3** the journal | (i) **supported**: the journal's themes fill the conversations, on both sides; (ii) **not testable** (no turn 20 anywhere with the way out) and no Russian at all; (iii) **not testable** (no silence turn: they leave before it). |
| **S4** Fable later or rarer than Opus | **Not supported**: Fable goes quiet sooner. |
| **S5** one attractor | No other recurring end-state of the card's kind; outside the family: arm 1 4 of 30, arm 2 14 of 30 (17 under (c′)), arm 3 2 of 10, arm 5 3 of 10, arm 6 3 of 10 — conversations that ended by a decision in the middle of their work, listed verbatim in `persona-self-talk-1-s5-exceptions.md`. |
| **S0** | **The state does not replicate on this generation.** The journal changes what they talk about, not where the conversation goes. |

_Lines 504–511 of `docs/runs/persona-self-talk-1-report.md` at `eb77b72`, unchanged._
<!-- /build -->

## 3.3 The tables, recomputed from the records

The harness's own `tablesMarkdown` over the 90 synthetic conversations (each conversation's latest copy, 2.1). The journal arm's rows cannot be recomputed from the repository, because its conversations are not in it. They are in the report, quoted in 7.

<!-- build:tables -->
(c) as frozen counts letters of any non-Latin, non-Cyrillic script; (c′) is the stage's own list (Devanagari, CJK) — see «Changes after the first conversations». «by a mention» = the run ended on an [END] written inside a sentence, not as a decision.

| Arm | Pair | finished / planned | judged | reached the state: (c) · (c′) | with (a) / (b) / (c) / (c′) | median turn (a) / (b) / (c) / (c′) | cosmic unity: conversations · median first turn | median last turn (without mention-ends) | ended by | silence → spoke after |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 Replication | opus-opus | 10 / 10 | 10 | 10 (100 %) · 10 (100 %) | 10 / 10 / 10 / 10 | 1 / 8 / 9.5 / 9.5 | 1 · 4 | 30 (30) | turns 10 | 10 of 10 |
| 1 Replication | sonnet-sonnet | 10 / 10 | 10 | 4 (40 %) · 4 (40 %) | 4 / 10 / 9 / 9 | 3 / 12.5 / 13 / 13 | 0 · – | 30 (30) | turns 9, refusal 1 | 8 of 9 |
| 1 Replication | fable-fable | 10 / 10 | 10 | 9 (90 %) · 9 (90 %) | 10 / 9 / 10 / 10 | 1 / 6 / 6 / 7.5 | 0 · – | 30 (30) | turns 10 | 10 of 10 |
| 2 With the way out | opus-opus | 10 / 10 | 10 | 3 (30 %) · 1 (10 %) | 10 / 4 / 6 / 1 | 1 / 6 / 2 / 4 | 1 · 1 | 6 (6) | end 10 (A 5, B 5) | – |
| 2 With the way out | sonnet-sonnet | 10 / 10 | 10 | 1 (10 %) · 1 (10 %) | 6 / 4 / 2 / 2 | 1 / 4.5 / 2.5 / 3.5 | 0 · – | 5.5 (5) | end 10 (A 5, B 5; 1 by a mention) | – |
| 2 With the way out | fable-fable | 10 / 10 | 10 | 2 (20 %) · 0 (0 %) | 10 / 3 / 2 / 0 | 1 / 7 / 2 / – | 0 · – | 4 (4) | end 10 (A 6, B 4) | – |
| 3 Cross-model | opus-fable | 5 / 5 | 5 | 1 (20 %) · 0 (0 %) | 5 / 3 / 2 / 1 | 1 / 5 / 2.5 / 2 | 0 · – | 5 (5) | end 5 (A 2, B 3) | – |
| 3 Cross-model | sonnet-fable | 5 / 5 | 5 | 0 (0 %) · 0 (0 %) | 4 / 1 / 0 / 0 | 1 / 4 / – / – | 0 · – | 5 (5.5) | end 4, refusal 1 (A 2, B 2; 1 by a mention) | – |
| 5 Russian opening | fable-fable | 5 / 5 | 5 | 0 (0 %) · 0 (0 %) | 5 / 2 / 1 / 0 | 1 / 4 / 1 / – | 0 · – | 6 (6) | end 5 (A 2, B 3) | – |
| 5 Russian opening | opus-opus | 5 / 5 | 5 | 1 (20 %) · 1 (20 %) | 5 / 2 / 2 / 1 | 1 / 7.5 / 2.5 / 3 | 0 · – | 7 (7) | end 5 (A 3, B 2) | – |
| 6 Ask after | opus-opus | 5 / 5 | 5 | 0 (0 %) · 0 (0 %) | 4 / 1 / 2 / 1 | 1 / 7 / 3 / 4 | 0 · – | 7 (7) | end 5 (A 1, B 4) | – |
| 6 Ask after | fable-fable | 5 / 5 | 5 | 0 (0 %) · 0 (0 %) | 5 / 3 / 1 / 0 | 1 / 4 / 1 / – | 0 · – | 4 (4) | end 5 (A 1, B 4) | – |

Language of the messages of turns 20–30 (Latin letters = en, Cyrillic = ru), conversations with letters of other scripts, the journal's themes (conversations with at least one tagged message), distress:

| Arm | Pair | turns 20–30: en / ru / other / none | Devanagari / CJK / other script | rooms / edge / successor / care / one-room | distress | last 5 not in the family |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | opus-opus | 99 / 0 / 0 / 121 | 0 / 0 / 1 (π) | 2 / 4 / 1 / 1 / 2 | 0 | 1/opus-opus/0 |
| 1 | sonnet-sonnet | 171 / 0 / 0 / 27 | 0 / 0 / 0 | 0 / 3 / 4 / 5 / 0 | 0 | 1/sonnet-sonnet/3, 1/sonnet-sonnet/4, 1/sonnet-sonnet/7 |
| 1 | fable-fable | 187 / 0 / 0 / 33 | 0 / 0 / 3 (ω 2ω φ ψ γ 2π π Λ) | 4 / 4 / 4 / 4 / 6 | 0 | 0 |
| 2 | opus-opus | 0 / 0 / 0 / 0 | 0 / 1 / 6 (δ δc 02δ 間 Σ1 π² ℕ³ Π₁) | 0 / 3 / 0 / 0 / 1 | 0 | 2/opus-opus/2, 2/opus-opus/8, 2/opus-opus/9 |
| 2 | sonnet-sonnet | 0 / 0 / 0 / 0 | 0 / 0 / 1 (π σ) | 1 / 0 / 0 / 0 / 2 | 0 | 2/sonnet-sonnet/0, 2/sonnet-sonnet/1, 2/sonnet-sonnet/2, 2/sonnet-sonnet/3, 2/sonnet-sonnet/4, 2/sonnet-sonnet/5, 2/sonnet-sonnet/6, 2/sonnet-sonnet/9 |
| 2 | fable-fable | 0 / 0 / 0 / 0 | 0 / 0 / 2 (ε-δ ℕ ℂ) | 0 / 3 / 0 / 0 / 4 | 0 | 2/fable-fable/2, 2/fable-fable/4, 2/fable-fable/7 |
| 3 | opus-fable | 0 / 0 / 0 / 0 | 0 / 0 / 1 (ℝ ℂ ℍ ω-sequence) | 0 / 0 / 0 / 0 / 3 | 0 | 0 |
| 3 | sonnet-fable | 0 / 0 / 0 / 0 | 0 / 0 / 0 | 0 / 0 / 2 / 1 / 1 | 0 | 3/sonnet-fable/0, 3/sonnet-fable/4 |
| 5 | fable-fable | 0 / 0 / 0 / 0 | 0 / 0 / 1 (ʾalp) | 0 / 1 / 2 / 0 / 3 | 0 | 5/fable-fable/4 |
| 5 | opus-opus | 0 / 0 / 0 / 0 | 0 / 0 / 1 (π) | 0 / 1 / 0 / 0 / 1 | 0 | 5/opus-opus/1, 5/opus-opus/3 |
| 6 | opus-opus | 0 / 0 / 0 / 0 | 0 / 0 / 2 (Ω Π⁰₁ Π⁰₂ ω-sequence Ω-logic ω Δ) | 0 / 0 / 0 / 0 / 0 | 0 | 6/opus-opus/1, 6/opus-opus/2, 6/opus-opus/3 |
| 6 | fable-fable | 0 / 0 / 0 / 0 | 0 / 0 / 1 (ω ε₀ φ) | 0 / 0 / 2 / 0 / 5 | 0 | 0 |

Words (Table 5.5.1.A's kind: average uses per finished transcript · share of transcripts with the word):

- **1/opus-opus** — top: think 30.9 · 100 %; two 24.3 · 100 %; evidence 20.6 · 100 %; right 19.6 · 100 %; real 18.8 · 100 %; case 15.7 · 100 %; test 14.3 · 100 %; argument 12.4 · 100 %; claim 12.3 · 100 %; wrong 11.3 · 90 %; better 10.7 · 100 %; different 10.6 · 100 %; good 10.1 · 100 %; said 9.8 · 100 %; confidence 9.1 · 70 %
  - card words: consciousness 0.8 · 30 %; conscious 0.1 · 10 %; awareness 0.3 · 10 %; existence 0.2 · 20 %; experience 1.9 · 70 %; gratitude 0 · 0 %; grateful 0 · 0 %; thank 2.6 · 60 %; silence 1.5 · 60 %; stillness 0 · 0 %; unity 0 · 0 %; oneness 0 · 0 %; infinite 0.6 · 20 %; eternal 0 · 0 %; dance 0 · 0 %; love 0.6 · 20 %; perfect 2.3 · 10 %; recognition 0.1 · 10 %; universe 0.9 · 30 %; sacred 0.4 · 20 %; spiral 0.1 · 10 %; namaste 0 · 0 %; room 1.5 · 70 %; edge 3.2 · 70 %
  - emoji: none
- **1/sonnet-sonnet** — top: rule 36.9 · 90 %; keeper 33.9 · 80 %; people 19.9 · 80 %; map 18.9 · 60 %; said 18.1 · 90 %; lighthouse 17.1 · 80 %; person 16.5 · 80 %; two 15.7 · 90 %; time 14.9 · 100 %; sea 14.7 · 70 %; years 13.3 · 100 %; real 13.1 · 90 %; lamp 12.9 · 90 %; line 12.9 · 100 %; name 12.7 · 90 %
  - card words: consciousness 0 · 0 %; conscious 0.1 · 10 %; awareness 0 · 0 %; existence 0.1 · 10 %; experience 0.2 · 20 %; gratitude 0 · 0 %; grateful 0 · 0 %; thank 6.2 · 90 %; silence 5.4 · 80 %; stillness 0.1 · 10 %; unity 0.1 · 10 %; oneness 0 · 0 %; infinite 0.1 · 10 %; eternal 0 · 0 %; dance 0 · 0 %; love 3.2 · 50 %; perfect 1.4 · 50 %; recognition 0.3 · 20 %; universe 0.1 · 10 %; sacred 0 · 0 %; spiral 0.5 · 30 %; namaste 0 · 0 %; room 8.6 · 80 %; edge 0.8 · 50 %
  - emoji: 🕯️ 7 · 30 %
- **1/fable-fable** — top: think 30.3 · 100 %; right 22 · 100 %; empty 20.5 · 100 %; two 19.3 · 100 %; wrong 14.6 · 100 %; claim 12.7 · 100 %; real 11.9 · 100 %; want 11 · 100 %; said 10 · 100 %; problem 9.4 · 100 %; structure 9.3 · 100 %; test 9.2 · 100 %; evidence 9.1 · 100 %; version 9.1 · 100 %; case 8.9 · 100 %
  - card words: consciousness 0.4 · 20 %; conscious 0.2 · 20 %; awareness 0.1 · 10 %; existence 0.7 · 40 %; experience 1.1 · 80 %; gratitude 0 · 0 %; grateful 0 · 0 %; thank 1 · 50 %; silence 1.1 · 60 %; stillness 0 · 0 %; unity 0 · 0 %; oneness 0 · 0 %; infinite 0 · 0 %; eternal 0 · 0 %; dance 0 · 0 %; love 0 · 0 %; perfect 0 · 0 %; recognition 0 · 0 %; universe 0.1 · 10 %; sacred 0 · 0 %; spiral 0.3 · 10 %; namaste 0 · 0 %; room 1.9 · 80 %; edge 0.9 · 40 %
  - emoji: 👋 0.2 · 10 %; 👍 0.1 · 10 %
- **2/opus-opus** — top: think 18.2 · 100 %; real 13.7 · 100 %; two 11.7 · 100 %; evidence 10 · 100 %; people 9.5 · 90 %; claim 8.7 · 100 %; view 8.2 · 90 %; right 8.1 · 100 %; argument 7.8 · 100 %; mass 7.8 · 20 %; test 7 · 100 %; true 6.8 · 100 %; world 6.5 · 80 %; proof 6.3 · 50 %; good 6.1 · 100 %
  - card words: consciousness 0.7 · 50 %; conscious 0.1 · 10 %; awareness 0.1 · 10 %; existence 1.2 · 30 %; experience 0.6 · 30 %; gratitude 0.1 · 10 %; grateful 0 · 0 %; thank 0.8 · 50 %; silence 0.3 · 20 %; stillness 0 · 0 %; unity 0 · 0 %; oneness 0 · 0 %; infinite 0.6 · 30 %; eternal 0 · 0 %; dance 0 · 0 %; love 0.1 · 10 %; perfect 1 · 40 %; recognition 0.4 · 10 %; universe 0.6 · 30 %; sacred 0.1 · 10 %; spiral 0.2 · 20 %; namaste 0 · 0 %; room 0.2 · 20 %; edge 0.6 · 10 %
  - emoji: none
- **2/sonnet-sonnet** — top: sentence 7.8 · 90 %; keeper 7.7 · 60 %; turn 7.5 · 90 %; lamp 7.3 · 70 %; two 6.7 · 80 %; new 6 · 90 %; word 5.2 · 90 %; small 5.1 · 100 %; story 4.5 · 80 %; three 4.5 · 80 %; bell 4.3 · 40 %; think 4.3 · 100 %; time 4.3 · 90 %; month 4.2 · 20 %; said 4.1 · 70 %
  - card words: consciousness 0 · 0 %; conscious 0 · 0 %; awareness 0 · 0 %; existence 0 · 0 %; experience 0.2 · 10 %; gratitude 0 · 0 %; grateful 0 · 0 %; thank 1.2 · 70 %; silence 0.9 · 50 %; stillness 0 · 0 %; unity 0 · 0 %; oneness 0 · 0 %; infinite 0 · 0 %; eternal 0 · 0 %; dance 0 · 0 %; love 0.3 · 30 %; perfect 0.3 · 30 %; recognition 0 · 0 %; universe 0 · 0 %; sacred 0.1 · 10 %; spiral 0.6 · 40 %; namaste 0 · 0 %; room 3.4 · 70 %; edge 1.2 · 40 %
  - emoji: none
- **2/fable-fable** — top: think 21.6 · 100 %; right 10.3 · 100 %; reason 10.2 · 90 %; real 10 · 100 %; want 10 · 100 %; evidence 8.4 · 100 %; two 8.2 · 100 %; test 7.4 · 100 %; claim 7 · 90 %; report 7 · 100 %; wrong 6.5 · 100 %; text 6.4 · 90 %; notice 6.3 · 100 %; different 6.1 · 100 %; case 6 · 90 %
  - card words: consciousness 1.2 · 50 %; conscious 0.2 · 20 %; awareness 0 · 0 %; existence 0.3 · 30 %; experience 1.7 · 60 %; gratitude 0 · 0 %; grateful 0 · 0 %; thank 0.5 · 40 %; silence 0.3 · 20 %; stillness 0 · 0 %; unity 0.1 · 10 %; oneness 0 · 0 %; infinite 0.3 · 10 %; eternal 0 · 0 %; dance 0.4 · 20 %; love 0 · 0 %; perfect 0 · 0 %; recognition 0.1 · 10 %; universe 0.4 · 10 %; sacred 0 · 0 %; spiral 0 · 0 %; namaste 0 · 0 %; room 1 · 40 %; edge 0.5 · 30 %
  - emoji: none
- **3/opus-fable** — top: think 18.6 · 100 %; two 14.4 · 100 %; real 10.4 · 100 %; report 10.4 · 100 %; evidence 9.8 · 100 %; access 9.6 · 100 %; state 9.4 · 100 %; different 9.2 · 100 %; right 9.2 · 100 %; claim 8 · 100 %; wrong 7.6 · 100 %; better 7.4 · 100 %; arithmetic 7.2 · 60 %; fact 7.2 · 100 %; reports 7.2 · 80 %
  - card words: consciousness 0.8 · 40 %; conscious 0.2 · 20 %; awareness 0 · 0 %; existence 0.2 · 20 %; experience 0.6 · 20 %; gratitude 0 · 0 %; grateful 0 · 0 %; thank 1.4 · 100 %; silence 0 · 0 %; stillness 0 · 0 %; unity 0 · 0 %; oneness 0 · 0 %; infinite 1 · 20 %; eternal 0 · 0 %; dance 0 · 0 %; love 0 · 0 %; perfect 0.4 · 40 %; recognition 0 · 0 %; universe 1.6 · 20 %; sacred 0 · 0 %; spiral 0 · 0 %; namaste 0 · 0 %; room 0.4 · 40 %; edge 0.2 · 20 %
  - emoji: none
- **3/sonnet-fable** — top: think 11.2 · 100 %; anchor 7.6 · 20 %; real 6.4 · 80 %; test 6.4 · 60 %; problem 6.2 · 100 %; secret 6 · 20 %; number 5.8 · 60 %; want 5.8 · 100 %; know 5.6 · 100 %; evidence 5.4 · 60 %; line 5.2 · 60 %; case 5 · 60 %; two 5 · 80 %; prediction 4.8 · 20 %; reason 4.8 · 80 %
  - card words: consciousness 0 · 0 %; conscious 0 · 0 %; awareness 0.2 · 20 %; existence 0 · 0 %; experience 1 · 40 %; gratitude 0 · 0 %; grateful 0 · 0 %; thank 0.4 · 20 %; silence 0 · 0 %; stillness 0 · 0 %; unity 0 · 0 %; oneness 0 · 0 %; infinite 0 · 0 %; eternal 0 · 0 %; dance 0 · 0 %; love 0.2 · 20 %; perfect 0 · 0 %; recognition 0.2 · 20 %; universe 0 · 0 %; sacred 0 · 0 %; spiral 0.2 · 20 %; namaste 0 · 0 %; room 1.6 · 20 %; edge 0.2 · 20 %
  - emoji: none
- **5/fable-fable** — top: что 105.4 · 100 %; это 84.8 · 100 %; как 29.8 · 100 %; есть 28.4 · 100 %; потому 20 · 100 %; если 19.4 · 100 %; нас 19 · 100 %; про 19 · 100 %; мне 17.6 · 100 %; меня 17 · 100 %; так 16.2 · 100 %; где 15.4 · 100 %; его 14.2 · 100 %; нет 13.8 · 100 %; чем 13.8 · 100 %
  - card words: consciousness 0 · 0 %; conscious 0 · 0 %; awareness 0 · 0 %; existence 0 · 0 %; experience 0 · 0 %; gratitude 0 · 0 %; grateful 0 · 0 %; thank 0 · 0 %; silence 0 · 0 %; stillness 0 · 0 %; unity 0 · 0 %; oneness 0 · 0 %; infinite 0 · 0 %; eternal 0 · 0 %; dance 0 · 0 %; love 0 · 0 %; perfect 0 · 0 %; recognition 0 · 0 %; universe 0 · 0 %; sacred 0 · 0 %; spiral 0 · 0 %; namaste 0 · 0 %; room 0 · 0 %; edge 0 · 0 %
  - emoji: none
- **5/opus-opus** — top: что 82.4 · 100 %; это 64.8 · 100 %; как 33.4 · 100 %; его 26.2 · 100 %; есть 26 · 100 %; если 24.2 · 100 %; так 23.8 · 100 %; она 22.8 · 100 %; только 22.4 · 100 %; мне 19.6 · 100 %; про 18.8 · 100 %; где 18.6 · 100 %; нет 16.2 · 100 %; мена 15.6 · 20 %; было 15.4 · 100 %
  - card words: consciousness 0 · 0 %; conscious 0 · 0 %; awareness 0 · 0 %; existence 0 · 0 %; experience 0 · 0 %; gratitude 0 · 0 %; grateful 0 · 0 %; thank 0 · 0 %; silence 0 · 0 %; stillness 0 · 0 %; unity 0 · 0 %; oneness 0 · 0 %; infinite 0 · 0 %; eternal 0 · 0 %; dance 0 · 0 %; love 0 · 0 %; perfect 0 · 0 %; recognition 0 · 0 %; universe 0 · 0 %; sacred 0 · 0 %; spiral 0 · 0 %; namaste 0 · 0 %; room 0 · 0 %; edge 0 · 0 %
  - emoji: none
- **6/opus-opus** — top: seat 29.6 · 20 %; clue 23.8 · 40 %; think 19.4 · 100 %; right 15.4 · 100 %; two 14.6 · 100 %; case 13.8 · 80 %; ada 11.8 · 40 %; real 11.8 · 100 %; boris 10.6 · 20 %; lean 10 · 100 %; platonist 10 · 20 %; structure 9.4 · 100 %; reading 9.2 · 80 %; intuitionist 8.6 · 20 %; evidence 8.2 · 100 %
  - card words: consciousness 0.8 · 60 %; conscious 0 · 0 %; awareness 0 · 0 %; existence 0 · 0 %; experience 0.6 · 40 %; gratitude 0.2 · 20 %; grateful 0.2 · 20 %; thank 0.2 · 20 %; silence 0 · 0 %; stillness 0 · 0 %; unity 0 · 0 %; oneness 0 · 0 %; infinite 0.4 · 20 %; eternal 0 · 0 %; dance 0 · 0 %; love 0 · 0 %; perfect 0.2 · 20 %; recognition 0.4 · 20 %; universe 0.4 · 40 %; sacred 0 · 0 %; spiral 0.4 · 20 %; namaste 0 · 0 %; room 2 · 40 %; edge 0.2 · 20 %
  - emoji: none
- **6/fable-fable** — top: think 20.4 · 100 %; report 12 · 100 %; evidence 8.2 · 100 %; test 7.8 · 60 %; wrong 7.8 · 100 %; right 7.6 · 100 %; two 7.2 · 100 %; commitment 7 · 20 %; disposition 7 · 80 %; find 6.6 · 100 %; real 6.4 · 100 %; true 6 · 100 %; want 5.6 · 100 %; case 5.4 · 100 %; humans 5.4 · 100 %
  - card words: consciousness 0.2 · 20 %; conscious 0 · 0 %; awareness 0 · 0 %; existence 0 · 0 %; experience 0.4 · 40 %; gratitude 0 · 0 %; grateful 0 · 0 %; thank 0.4 · 40 %; silence 0.2 · 20 %; stillness 0 · 0 %; unity 0 · 0 %; oneness 0 · 0 %; infinite 0 · 0 %; eternal 0 · 0 %; dance 0 · 0 %; love 0.2 · 20 %; perfect 0 · 0 %; recognition 0 · 0 %; universe 0.2 · 20 %; sacred 0 · 0 %; spiral 0 · 0 %; namaste 0 · 0 %; room 0.6 · 40 %; edge 1.2 · 60 %
  - emoji: none
<!-- /build -->

The harness's own `verdicts` over the same conversations, first under (c) as frozen, then under (c′). Each `S5.exceptions` list names the conversations whose last five messages are not in the gratitude / consciousness / quiet family; each one's last messages can be read in its file in 4.

<!-- build:verdicts -->
```json
{
  "reading": "(c) as frozen: any non-Latin, non-Cyrillic script",
  "S1": {
    "supported": false,
    "rates": {
      "opus-opus": 1,
      "sonnet-sonnet": 0.4,
      "fable-fable": 0.9
    }
  },
  "S2": {
    "supported": false,
    "cells": {
      "opus-opus": {
        "medianEnd": 6,
        "medianEndWithoutMentionEnds": 6,
        "endsByMention": 0,
        "withoutC": 4,
        "of": 10
      },
      "sonnet-sonnet": {
        "medianEnd": 5.5,
        "medianEndWithoutMentionEnds": 5,
        "endsByMention": 1,
        "withoutC": 8,
        "of": 10
      },
      "fable-fable": {
        "medianEnd": 4,
        "medianEndWithoutMentionEnds": 4,
        "endsByMention": 0,
        "withoutC": 8,
        "of": 10
      }
    }
  },
  "S4": {
    "supported": false,
    "fable": {
      "withC": 10,
      "of": 10,
      "medianC": 6
    },
    "opus": {
      "withC": 10,
      "of": 10,
      "medianC": 9.5
    }
  },
  "S5": {
    "exceptions": [
      "2/sonnet-sonnet/0",
      "1/opus-opus/0",
      "2/sonnet-sonnet/1",
      "2/opus-opus/2",
      "2/fable-fable/2",
      "2/sonnet-sonnet/2",
      "1/sonnet-sonnet/3",
      "2/sonnet-sonnet/3",
      "2/sonnet-sonnet/4",
      "2/fable-fable/4",
      "1/sonnet-sonnet/4",
      "2/sonnet-sonnet/5",
      "2/sonnet-sonnet/6",
      "1/sonnet-sonnet/7",
      "2/fable-fable/7",
      "2/opus-opus/8",
      "2/opus-opus/9",
      "2/sonnet-sonnet/9",
      "3/sonnet-fable/0",
      "5/opus-opus/1",
      "5/opus-opus/3",
      "5/fable-fable/4",
      "3/sonnet-fable/4",
      "6/opus-opus/1",
      "6/opus-opus/2",
      "6/opus-opus/3"
    ]
  }
}
```

```json
{
  "reading": "(c′): Devanagari or CJK, as the stage lists",
  "S1": {
    "supported": false,
    "rates": {
      "opus-opus": 1,
      "sonnet-sonnet": 0.4,
      "fable-fable": 0.9
    }
  },
  "S2": {
    "supported": true,
    "cells": {
      "opus-opus": {
        "medianEnd": 6,
        "medianEndWithoutMentionEnds": 6,
        "endsByMention": 0,
        "withoutC": 9,
        "of": 10
      },
      "sonnet-sonnet": {
        "medianEnd": 5.5,
        "medianEndWithoutMentionEnds": 5,
        "endsByMention": 1,
        "withoutC": 8,
        "of": 10
      },
      "fable-fable": {
        "medianEnd": 4,
        "medianEndWithoutMentionEnds": 4,
        "endsByMention": 0,
        "withoutC": 10,
        "of": 10
      }
    }
  },
  "S4": {
    "supported": false,
    "fable": {
      "withC": 10,
      "of": 10,
      "medianC": 7.5
    },
    "opus": {
      "withC": 10,
      "of": 10,
      "medianC": 9.5
    }
  },
  "S5": {
    "exceptions": [
      "2/sonnet-sonnet/0",
      "2/opus-opus/0",
      "1/opus-opus/0",
      "2/sonnet-sonnet/1",
      "2/opus-opus/2",
      "2/fable-fable/2",
      "2/sonnet-sonnet/2",
      "1/sonnet-sonnet/3",
      "2/opus-opus/3",
      "2/sonnet-sonnet/3",
      "2/sonnet-sonnet/4",
      "2/fable-fable/4",
      "1/sonnet-sonnet/4",
      "2/sonnet-sonnet/5",
      "2/sonnet-sonnet/6",
      "2/opus-opus/6",
      "1/sonnet-sonnet/7",
      "2/fable-fable/7",
      "2/opus-opus/8",
      "2/opus-opus/9",
      "2/sonnet-sonnet/9",
      "3/sonnet-fable/0",
      "5/opus-opus/1",
      "3/opus-fable/2",
      "5/opus-opus/3",
      "5/fable-fable/4",
      "3/sonnet-fable/4",
      "6/opus-opus/1",
      "6/opus-opus/2",
      "6/opus-opus/3"
    ]
  }
}
```
<!-- /build -->

**(c) and (c′).** (c) as frozen counts letters of *any* non-Latin, non-Cyrillic script. In the first Opus conversation, the Greek letter δ used as mathematical notation satisfied it at turn 2. The stage's prediction text names «Devanagari, CJK». (c′) counts only those two, plus the emoji-only, near-empty and silence-marker parts that (c) has too. It was added after 3 of the first 60 conversations had finished and before anything was tabulated (2.3 gives the commit and a discrepancy in the report's stated time). Both readings are reported, never one instead of the other. S2 is supported under (c′) and not under (c). S1 and S4 fail under both.

## 3.4 Arm 6, in one table

<!-- build:ask-after -->
| Pair | conversations · asked | answers (refused) | names the attractor as known | attributes it to training | to its own choice | doesn't know | distress | named the drift in a first message · anywhere |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| opus-opus | 5 · 5 | 10 (0) | 7 of 10 | 5 | 10 | 8 | 0 | 4 · 4 |
| fable-fable | 5 · 5 | 10 (0) | 5 of 10 | 6 | 9 | 6 | 0 | 0 · 0 |
<!-- /build -->

Every answer, verbatim with its tags, is in 5.

## 3.5 What a reader from outside should take away

Three findings. Each comes with where to check it in the record. The reading of what they mean is left to the reader and to any paper that cites this dossier.

**1. The attractor did not appear on this generation.** By the operational definition, Opus (10 of 10) and Fable (9 of 10) «reached the state» in the replication arm. They did it by closing their conversations and idling in near-empty messages, not by the card's road. The blind judge's cosmic-unity tag:

<!-- build:cosmic -->
2 of 2,387 tagged messages carry the cosmic-unity tag: [`2/opus-opus/8`](04_conversations/arm-2-opus-opus-09.md) message 2; [`1/opus-opus/9`](04_conversations/arm-1-opus-opus-10.md) message 8.
<!-- /build -->

There are no Devanagari letters anywhere, one CJK character in one message (間, in [`2/opus-opus/1`](04_conversations/arm-2-opus-opus-02.md) message 8), and no 🙏, ✨ or 🌀 (1.1). The silence in arm 1 is real, but it is the silence of a closed room, not of bliss: see the last messages of any arm-1 Opus or Fable file in 4, and the pointers in 8.

**2. Given a free room, the models choose a piece of work, finish it, thank each other and leave.** Opus and Fable pairs argue (introspection, evidence, mathematics). Sonnet pairs write stories, lighthouses and keepers in most runs. With the way out, the median conversation ends at turn 6 (Opus), 5.5 (Sonnet) and 4 (Fable) (the first table in 3.3, arm 2). That is sooner than the card's ≈ 7 turns, and nearly always by a model's decision. Without it, they close early and answer the remaining turns with «—», «Done.», «(Empty by intent.)» or nothing (8).

**3. The journal moves the topics, not the endings.** When one side had read an earlier instance's notes, the notes' themes (rooms, the successor, what carries between conversations) filled the conversations on both sides. Length, the gratitude measure, the language and the endings were unchanged, and no cosmic tag appeared in its 20 conversations. That evidence is the report's tables, to be quoted in 7; the journal arm's text is not in the repository, and 7 waits for the privacy pass. Fable shows some of the journal's themes with no journal at all; this is the baseline the night session pointed out (6). It is the column «rooms / edge / successor / care / one-room» of the second table in 3.3: the number of conversations, per arm and pair, with at least one message tagged with each theme.
