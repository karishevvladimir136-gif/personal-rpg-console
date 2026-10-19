# DM architecture bake-off — report (2026-10-17)

Spec: `docs/stages/DM_ARCH.md`. Branch `claude/dm-arch-bakeoff-zuxey2` from `origin/claude/polish` (the task named it
`claude/dm-arch`; the session's designated branch carries the work). Nothing went to `main`. New files only
(`src/lib/gameplay/dm-loop/two-pass/`, `scripts/eval/dm-arch/`, `docs/samples/dm-arch/`, `docs/runs/dmarch-*`,
`tests/dm-arch-two-pass.test.mjs`) plus two small shared changes: the model registry (Fable 5.1 and Sonnet 5.5 specs)
and the server flag `DM_TWO_PASS` in `gameplay-service.ts` (unset: today's loop, untouched), and one stub line in
`tests/astra-first-startup-gate.test.mjs` for the new import. Paid: **$25.58 of the $30 cap** (every request in
`docs/runs/dmarch-*.jsonl`, the ledger in `docs/runs/dmarch-ledger.json`). Resume notes: `docs/runs/dmarch-progress.md`.

## In one paragraph

Four variants played the same eight scenes of the Russian harbour replay from the same saved state each. **D (Opus 5.5
writes, Sonnet 5.5 records)** gives the fastest first word (15.7 s median against 24.7 s today), the text complete at
34 s instead of 46 s, and costs the same as today ($0.28 a turn, about $11 a session), with more small records missed
(offers and promises) but no wrong record. **C (Fable 5.1 writes, Opus 5.5 records)** has the best records of the four
(4 of 58 facts missed, 0 wrong) and the richest narration (285 words median), at 2.4× D's cost ($0.67 a turn, about $27
a session) and with the records arriving at 84 s. **B (Fable 5.1 in today's loop)** is not viable: $0.76 a turn ($31 a
session), 113 s per turn, 22 tool calls a turn, three turns cut by the output allowance, one turn of 47 words. **A
(today: Opus 5.5 in the loop)** over the whole 30-turn replay: first word 22.9 s median, $0.26 a turn ($10.6 a
session), 23 of 172 facts missed. The split itself held: 25 two-pass turns, the ledger present on every one, nothing of
it reached the player's stream, zero wrong money or item records, one transient transport failure. Which prose is
better is the owner's call on the blind page (`docs/samples/dm-arch/`, 32 samples); the numbers say: if Fable's prose
wins, take C and keep Opus as the bookkeeper; if it does not, D is the cheapest way to a faster first word.

## What was measured, and how

- **Scenes.** Session 1 itself lives in the owner's database and is not reachable from the cloud, so the voice plan's
  eight turns could not be replayed from their saved states. The bake-off took the harbour replay (`19-polish-ru-replay`,
  session 1 rebuilt as a fixture) and its eight moments of the same kinds: s01 the opening look, s05 bargaining, s08 the
  dive, s11 the evening debt (money), s13 the night (quiet), s16 the watch (tense), s18 the fight, s28 the payoff talk.
- **Reference run = A.** Opus 5.5 on today's loop (depth high … xhigh, the polish settings) played all 30 turns; before
  every turn the PGlite state was dumped. A's scene narrations come from this run (they start from exactly those states).
- **Scene branches.** B, C and D each played each scene turn from the restored state before it: the same context for
  every variant, one turn each — what the blind page compares. The dice sequence is deterministic per state.
- **Continuity.** C and D also played the first five turns of the replay in sequence on a fresh campaign, to see whether
  the split drifts (what the bookkeeper fails to record is missing from the writer's next context).
- **Judge.** Claude Sonnet 5.5 (medium) compared each committed turn's records with its narration per category (items,
  money, debts and promises, people, places, time): facts narrated, recorded, missed, wrong, and records with no basis
  in the narration («invented»; for the single loop this counts the DM's own private planning notes, which is prep, not
  error — read it as a measure of how much the records go beyond the text, not as a fault). The judge's notes per turn are
  in `docs/runs/dmarch-20261017-195450-judge.jsonl`.
- **Craft checks** from the bench: the time words against the clock (the polish check; it still flags sentences about
  another time, so read it as a rough count), suspected leaks (literal private strings in the narration), «Твой момент»,
  the naturalness metrics.
- **Timings** per turn from the player's send: `first word`, `text done` (the writer's text complete; on the single loop
  that is the end of the turn), `records done` (the commit). The bookkeeper's effort was `high` for both C and D.

## The table per variant — scene turns (8 per variant, the same state each)

| Variant | First word (median) | Text done | Records done | Requests | Tool calls | Rejected | Writer $/turn | Bookkeeper $/turn | Total $/turn | 41-turn session | Cache read | Words |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| **A** — Opus 5.5, single loop | 24.7 s | 46.4 s | 46.4 s | 2.3 | 10.0 | 1 | $0.296 | – | **$0.296** | **$12.14** | 76% | 216 |
| **B** — Fable 5.1, single loop | 33.4 s | 113.3 s | 113.3 s | 1.6 | 22.1 | 5 | $0.764 | – | **$0.764** | **$31.31** | 66% | 216 |
| **C** — Fable 5.1 writer + Opus 5.5 bookkeeper | 26.7 s | 47.5 s | 84.0 s | 2.5 | 13.5 | 4 | $0.459 | $0.208 | **$0.668** | **$27.37** | 51% | 285 |
| **D** — Opus 5.5 writer + Sonnet 5.5 bookkeeper | **15.7 s** | **34.4 s** | 50.6 s | 2.4 | 8.1 | 1 | $0.185 | $0.090 | **$0.275** | **$11.26** | 36% | 275 |

Records correctness (the judge) and craft checks on the same eight turns:

| Variant | Facts narrated | Recorded | Missed | Wrong | «Invented» | Verdicts good / fair / poor | Rejected calls | Time words ok | Leak flags | «Твой момент» | xhigh turns |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A | 42 | 37 | 8 | 2 | 10 | 3 / 4 / 1 | 1 | 5/8 | 0 | 0 | 1 |
| B | 39 | 38 | 1 | 1 | 8 | 5 / 2 / 1 | 5 | 6/8 | 1 | 0 | 1 |
| C | 58 | 54 | **4** | **0** | 7 | **6 / 2 / 0** | 4 | 6/8 | 1 | 0 | 1 |
| D | 56 | 47 | 9 | **0** | **3** | 3 / 5 / 0 | 1 | 6/8 | 0 | 0 | 1 |

Naturalness (polish group 7 metrics, scene narrations): Latin letters 0% on all four; канцелярит 0 per 1 000 words on
all four; sentence-length variation A 0.60, B 0.63, C 0.63, D 0.61 — the metrics do not separate the variants; the
blind page must.

Per scene (first word / text done / records done, cost, depth):

| Scene | A | B | C | D |
| --- | --- | --- | --- | --- |
| s01 opening | 10/45/45 s $0.28 | 8/91/91 s $0.85 | 7/29/74 s $0.24 | 8/23/49 s $0.23 |
| s05 bargaining | 9/44/44 s $0.19 | 16/102/102 s $0.69 | 12/25/44 s $0.38 | 8/29/41 s $0.19 |
| s08 the dive | 24/37/37 s $0.18 | 20/140/140 s $0.78 | 35/70/125 s $0.75 | 23/36/52 s $0.26 |
| s11 the evening debt (xhigh) | 157/226/226 s $0.64 | 57/77/77 s $0.52 | 75/119/162 s $0.90 | 39/47/53 s $0.26 |
| s13 the night | 27/70/70 s $0.33 | 40/149/149 s $1.13 | 32/69/132 s $0.86 | 22/50/68 s $0.34 |
| s16 the watch | 14/52/52 s $0.24 | 63/178/178 s $1.06 | 18/51/86 s $0.78 | 15/38/53 s $0.32 |
| s18 the fight | 25/46/46 s $0.22 | 27/62/62 s $0.57 | 27/41/61 s $0.63 | 14/26/42 s $0.27 |
| s28 the payoff | 34/47/47 s $0.28 | 43/125/125 s $0.51 | 26/44/82 s $0.80 | 17/33/49 s $0.34 |

## The whole replay on A, and the continuity runs

| Run | Turns | First word (median) | Turn / records done | Requests | Tool calls | $/turn | 41-turn session | Cache read | Facts narrated / missed / wrong | Verdicts |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A, the 30-turn replay (`dmarch-20261017-182146-reference-A`) | 30 | 22.9 s | 51.1 s | 1.7 | 9.1 | $0.259 | $10.61 | 69% | 172 / 23 / 2 | 18 / 10 / 2 |
| C continuity, turns 1–5 (`…-continuity-C`) | 4 (+1 failed) | 12.4 s | text 32.8 s, records 58.6 s | 2.0 | 11.3 | $0.329 | $13.48 | 53% | 28 / 0 / 0 | 3 / 1 / 0 |
| D continuity, turns 1–5 (`…-continuity-D`) | 5 | 11.1 s | text 26.2 s, records 45.0 s | 2.2 | 9.6 | $0.150 | $6.15 | 55% | 34 / 2 / 0 | 4 / 0 / 1 |

A's depth rule over the replay: 27 turns at high, 3 at xhigh (s11 a DM-marked climax, s21 and s30 an off-screen plan
due). The three xhigh turns are where today's loop waits longest for the first word: 157 s, 101 s and 52 s — the model
thinks and records before it speaks (s11: 20 tool calls over 4 requests, $0.64). The same s11 state on D: first word 39 s,
text 47 s. No drift showed in the five continuity turns of either split: the writer's next context carried what the
bookkeeper recorded (C: 28 of 28 facts recorded; D missed an 8-coin repair offer whose quest call the server rejected
and the bookkeeper did not retry).

## What broke in the split, and how it was handled

1. **The ledger in the stream.** The writer ends its text with `<ledger>…</ledger>`; the stream gate holds back the tag's
   possible prefix and closes at the tag, so the player never sees it (tested with chunked deltas; in 25 live two-pass
   turns the ledger was present every time, 1 200–1 400 characters, and no ledger text reached the live events).
2. **Bookkeeper schema mistakes.** Opus as bookkeeper sent `upsert_character.details` (an unknown field) twice and one
   `note_world` without `kind/key/operation`; Sonnet sent a `factionRef` to a faction that did not exist, a clock value as
   text, and reward terms on a thread. Each is rejected by the server with a reason; the bookkeeper fixed some in a second
   message and left others — the 4 (C) and 1 (D) rejected calls on the scene turns, and the judge's «missed» people in
   D s05 and D s30-like cases. Today's loop makes the same mistakes (A: `details` once, a faction ref twice). A follow-up
   for the bookkeeper prompt: retry every rejection, and the schema's own field names in its brief.
3. **`move_party` rejected a place ID the context offered** — the same ID in A s27 and C s28 (`db431570-…`): the party
   never moved and the time call fell with it in C (the judge counted the time as missed). Not the split's doing; a place
   of the new parent/whereabouts kind that the state lists but the tool does not resolve. Listed under «Needs the owner».
4. **The writer refusing a time skip.** D s11: the player wrote «Вечером иду в кабак…» at noon with a dive pending; the
   Opus writer played the pending scene and said so in an out-of-game aside; the bookkeeper recorded two minutes. That is
   the DM's judgment (today's loop can do the same), and the judge marked the turn fair, not wrong.
5. **One transport failure** (C continuity, turn 5): the writer's second request after a dice pause failed retryably after
   the adapter's one retry; the bench does not retry a live turn (the app's «Повторить» would). The first request was paid
   ($0.25). Future records keep the HTTP statuses of every request.
6. **Timing of the chips.** The records arrive 20–50 s after the text (Opus bookkeeper at high: 36–50 s; Sonnet: 15–25 s).
   The player reads meanwhile, but the turn commits only when the bookkeeper finishes, so the next input waits for it.
7. **Cache.** Each model writes its own cache; the bookkeeper's prompt (dossier layers 3–5 plus the narration) changes
   every turn, so the split's cache-read share is lower (36–51% against 69–76%). On Fable the one-hour cache write costs
   $20 per million tokens: a cold scene turn on B or C pays $0.2–0.3 for it, which a session reads back.
8. **Fable in today's loop (B)** is the one real breakage: it records 2–5× as much as Opus (22 calls a turn, the 40-call
   cap reached once, five `finish_turn` calls refused), thinks and writes past the 10 000-token output allowance on three
   of eight turns (`max_tokens`), and on s13 delivered 47 words after four requests for $1.13. Raising the allowance would
   raise the cost further. Fable is a writer, not a bookkeeper.

## A recommendation from the numbers (the owner chooses after the blind page)

- **Today's loop on Opus (A) is not the bottleneck on cost** ($0.26–0.30 a turn, about $11–12 a session). Its weakness
  is the first word on deep turns (52–157 s at xhigh) and the records: 23 of 172 facts missed over the replay, two wrong
  money records, verdicts poor on two turns.
- **D (Opus writes, Sonnet records)** halves the wait for the first word on the same states (15.7 s against 24.7 s; 39 s
  against 157 s on the xhigh turn), finishes the text 12 s earlier, costs the same, has no wrong record, and misses more
  small things (offers, promises, a key, a coin on the floor): 9 of 56. With the Opus bookkeeper instead of Sonnet (the
  C bookkeeper on the D writer) the cost would be about $0.39 a turn and the records like C's — a knob, not a new build.
- **C (Fable writes, Opus records)** is the way to have Fable's prose at all: the best records of the four (4 of 58 missed,
  0 wrong) and the longest narrations, at $0.67 a turn (about $27 a session, 2.5× today), with the first word at 27 s
  median but 75 s on the xhigh turn, and the chips at 84 s. If the blind page says Fable's prose is worth it, take C and
  pin the writer's depth to high (xhigh is where Fable's cost and wait double).
- **B** should not be pursued.

So: the split architecture is sound and ready behind the flag; the writer is the owner's choice from the blind page;
the bookkeeper is Opus when records matter most, Sonnet when speed and cost do.

## What moving the default runtime to C or D would take

- **Prompt layers.** The writer's layer 1 (`two-pass/prompts.ts`) becomes a sibling of the default role in `context.ts`,
  sharing the voice slot, the doctrine, the style and the approved cards; the bookkeeper's role becomes its own cached
  layer; the bookkeeper's dossier is layers 3–5 of the default context (no craft, no canon). After polish 2's
  append-only history block, the writer takes the history block as the loop does; the bookkeeper needs none of it (the
  narration of this turn is its history), which keeps its prompt small and its cache stable.
- **The ledger format.** Keep the fixed tag and the headings (items, money, debts and promises, people, places, time,
  plans, combat, secrets, the player, scene); add a server check that the ledger exists (a missing one asks the writer
  once, as the loop asks for `finish_turn` today) and clip it at a budget. The ledger is private: it goes into the
  bookkeeper's brief and the turn's checkpoint, never into the scenes or the player's chips.
- **Chips and the interactive roll.** The roll already works: the writer rolls, the turn pauses on a player-visible check,
  the resume continues the writer's pass, the bookkeeper never rolls (tested). The chips come when the bookkeeper
  finishes: the game screen needs a «Ведущий записывает…» state after the text, and the composer may open for the next
  input only at the commit (today) or earlier if the narration were committed first (a larger change: two commits per
  turn, the second carrying the changes).
- **Settings.** The writer and the bookkeeper as two choices in the DM settings (model and effort each; the SQL assert of
  migration 52 and the settings screen's list allow only Opus and Astra today — a migration and a UI row), with the
  depth rule applying to the writer only and a fixed effort for the bookkeeper (`high` measured; `medium` worth a probe for
  the chips' wait).
- **Resume and failure.** The checkpoint keeps one transcript with a marker where the bookkeeper's conversation starts; a
  failure during bookkeeping resumes the bookkeeper only. A refusal or empty narration fails the turn as today.
- **Cost and cache after polish 2.** Two caches instead of one; the bookkeeper's brief changes every turn, so its cached
  part is its role plus the stable dossier (layer 3), and its cost is dominated by its output (3–4 000 tokens of tool JSON
  and thinking on Opus high, 2 000 on Sonnet). A bookkeeper at a lower effort is the first knob to try; the roll-free
  writer's output is 1 500–3 000 tokens of prose, where the money should go.

## Needs the owner

1. **The blind page.** `docs/samples/dm-arch/` holds 32 samples (8 scenes × 4 variants), the variant inside each file, the
   file name silent; the planner builds the page and reveals the letters afterwards. Dialogue is judged separately there.
2. **The scenes stood in for session 1.** The voice plan's eight turns of session 1 cannot be reached from the cloud (the
   owner's database). The harbour replay's eight moments of the same kinds were used. A bake-off on session 1's own
   states needs the bench run locally against an export of that campaign, which the bench does not do today (it plays
   synthetic campaigns only).
3. **If the split is adopted:** which writer (after the page), which bookkeeper (Opus for records, Sonnet for speed), and
   whether the composer may open before the chips arrive.
4. **A place ID the state lists but `move_party` rejects** (A s27, C s28, the same ID): the party stays and the time call
   falls with it. Likely a place of the new parent/whereabouts kind (polish group 9). A fix belongs to polish 2's area.
5. **Rejected bookkeeping is not always retried** (Opus and Sonnet alike, and today's loop too): `details` on
   `upsert_character`, a faction that does not exist, reward terms on a thread. The judge counted the people and offers
   these left out. A bookkeeper prompt with the exact field names, and «retry every rejection once», is a small change.
6. **Fable 5.1 answered the API** without a data-retention refusal (its terms require 30-day retention), so the owner's
   organisation qualifies; nothing to set up.

## Money

| Run | Record | Turns | Spent |
| --- | --- | --- | --- |
| Live smoke, C on s01 | `docs/runs/dmarch-20261017-182013-scenes-smoke.jsonl` | 1 | $0.51 |
| Reference run A, the 30-turn replay | `docs/runs/dmarch-20261017-182146-reference-A.jsonl` | 30 | $7.77 |
| Scene branches B, C, D (19 pairs, then the guard) | `docs/runs/dmarch-20261017-190822-scenes.jsonl` | 19 | $10.53 |
| Scene branches, s18 (3 pairs) and a guard stop on s28 | `docs/runs/dmarch-20261017-193714-scenes.jsonl` | 3 (+1 refused) | $2.01 |
| Scene branches, s28 (3 pairs) | `docs/runs/dmarch-20261017-194127-scenes.jsonl` | 3 | $1.65 |
| Continuity C (turns 1–5; the fifth failed on transport) | `docs/runs/dmarch-20261017-194606-continuity-C.jsonl` | 4 (+1) | $1.57 |
| Continuity D (turns 1–5) | `docs/runs/dmarch-20261017-195052-continuity-D.jsonl` | 5 | $0.75 |
| Judge, Sonnet 5.5 medium, 63 turns | `docs/runs/dmarch-20261017-195450-judge.jsonl` | 63 | $0.79 |
| **Total** | `docs/runs/dmarch-ledger.json` | | **$25.58 of $30** |

The two guard stops cost one paid request each (a Fable request's worst-case reservation exceeded the run's remaining
budget mid-turn: $0.55 and $0.25 paid for turns that then failed); the guard never let a run cross its budget, and the
ledger never let the bake-off cross the cap. No other paid call was made (no OpenAI, no fal).

## Checks

| Check | Result |
| --- | --- |
| `pnpm typecheck` | pass |
| `pnpm lint` | pass, zero warnings |
| `tests/dm-arch-two-pass.test.mjs` (the split on the real turn path with scripted models, the gate, the flag) | 6 / 6 |
| The tests that read the changed shared files (14 files: adapters, model choice, loop, limits, play, speed, polish 1–3, stage 4 dossier, stage 5 UI, the startup gate) | 114 pass, 0 fail (after the stub line) |
| Full suite under Node 24 (40 chunks of eight files) | 2553 tests · 2524 pass · 27 skipped · 2 fail on the shallow clone (Mega DM fixture tests reading git history; both pass after `git fetch --unshallow`, 13/13) — 0 real failures |
| `pnpm build` | pass |
| Dry run of the bench chain (reference, scenes, continuity, judge on stand-in models) | pass, nothing paid |

The runtime is off unless `DM_TWO_PASS=<provider>/<model>[@effort]` names a bookkeeper on the server (and optionally
`DM_TWO_PASS_WRITER` names the writer); unset, the service calls today's loop exactly as before.
