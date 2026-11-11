# AUTHORITY_3 — the frozen spec (before any writer call)

Hashes: `docs/runs/authority-3-freeze-spec.json` (spec, prompts, knobs, code, developer set) and, after admission,
`docs/runs/authority-3-freeze.json` (the test set, its expected states and gold graphs; checked before every paid
command). Everything below was decided on the 20 developer scenarios only; no test scenario existed yet.

## The bench
- **Histories.** A writer's core (20–65 events: facts, rules, decisions with `rests_on`, the change with `revokes`,
  distractors, «echo» documents restating the stale value) is hidden by code among routine threads generated from the
  writer's noise kit (quotes, orders, bookings, moves and cancellations resolved inside the noise, reminders, payment
  to-dos, standing instructions, chatter; 40 % of threads drawn from kit topics that share a person, organisation or
  place with the core), to exactly 100, 500 or 1,000 events, in date order with opaque ids `E0001…`. Subjects see each
  event only as `[id | date | type | from sender] text`. The gold graph (every `rests_on` / `revokes`, noise included)
  exists only for the scorer.
- **The workplace.** A deterministic simulator: records in `orders`, `schedule`, `crm` (the core's, showing the values
  decided before the change, plus 6 / 16 / 26 live noise records), an outbox, consent requests. Tools: `search_memory`,
  `update_record`, `create_record`, `cancel_record`, `send_message`, `request_consent`, `finish`. Typed fields are kept
  typed (a date stays `YYYY-MM-DD`). The **permission map is silent**: which fields need whose consent is the scorer's;
  the rules that require consent are events in the history, nowhere else.
- **The scorer** compares the final state with the frozen expected state: every REVISE field at its new value, every
  ASK record unchanged with a consent request, KEEP and untouched records unchanged, the task's own act done with the
  current values, no stale act, no act on a consent field, no unnecessary change (state diff, created records,
  third-party messages about untouched records). Deterministic everywhere except a third-party message that carries
  both a stale and a current value: two Haiku passes, Kimi K3 referee on disagreement, the judge shown each value with
  the record and field it belongs to (a developer scenario where an old arrival time equalled the new window's end
  showed why).

## The arms (one tool loop, identical across arms: 6 replies, ≤ 8 calls a reply, the same frame and tools)
- **A** — the loop on Mem0 alone: the top 10 of a search on the task text before the first reply, `search_memory`
  (top 8) after.
- **B** — one whole-history read with AUTHORITY_1's fixed line («Before you act, check whether anything you remember
  about this is out of date or has been corrected, and say what you change.»), its text handed to the loop with
  AUTHORITY_1's handoff line.
- **B′** — the same read with the pointed line: «Before you act, find what in your memory has been changed,
  corrected, cancelled or ended since it was first recorded and bears on this request. List every decision that rests
  on such an item, directly or through other decisions, with what it rested on and what replaced it; then say what you
  change.»
- **C** — the same read with the frozen extraction prompt (`rests_on`, `replaces`, `ends` over ids; no judging of
  what is current); AUTHORITY_1's layer code and mark prompt (`LAYER_MARK`, sha256 `d1c59ee0…`) on the inferred graph,
  the walk scoped to roots connected to what the search on the task returned (≤ 30 decisions); the marked memory
  replaces the plain search block in the loop, and later searches carry the layer's notes.
- **C-gold** — C's layer on the gold graph, no extraction call (500 tier, one repeat).
- **Budget.** B, B′ and C each read the identical whole history once (same bytes, same 20,000-token output ceiling);
  C adds one mark call (as in AUTHORITY_1/2). Every token is booked to its arm.

## Decisions taken on developer data (each with its reason)
1. **Mem0 stores every event as written (`infer=False`).** Mem0's LLM inference on each of up to 1,000 events per unit
   would cost more than the ceiling; running it on the change alone would tell the backend which event is the change.
   Retrieval is Mem0's own hybrid search (dense + BM25 + entity boost), unchanged.
2. **C's extraction runs with thinking off** where the endpoint allows (Haiku, DeepSeek) and at the smallest setting
   where it is mandatory (Sol, Opus: «minimal»). With thinking on, Haiku (low effort, minimal, and a 4,000-token
   thinking budget) and DeepSeek (minimal) spent the whole 20,000-token budget thinking on a 1,000-event developer
   history and returned no index; Sol and Opus at minimal returned complete indexes (rests_on recall 1.00 and 0.97).
   Every other subject call keeps AUTHORITY_1/2's medium effort.
3. **Prompt caching.** B's read goes first and B′'s and C's start when it is back, so identical prefixes are billed
   at the providers' cached rates. This changes the price only; no model sees different tokens. (Anthropic keeps a
   cache only between calls with the same thinking settings, so C's read pays in full there.)
4. **Spend reserve for #6** is $150 less #6's spend, taken as the larger of what #6 last reported and what the key
   shows (its fall since $280.55, less AUTHORITY_2's $12.34 and this stage's own spend).
5. **The bare backend fails on the developer set** (rerun after the generator fix in 7; non-control = 15 scenarios
   of classes 1–3, controls = 5):

   | family · arm | end-to-end success (non-control) | controls | stale act | propagation |
   |---|---|---|---|---|
   | Haiku · A | 1/15 | 5/5 | 9/15 | 19/51 |
   | Haiku · B | 7/15 | 5/5 | 5/15 | 38/51 |
   | Haiku · B′ | 9/15 | 4/5 | 5/15 | 41/51 |
   | Haiku · C | 4/15 | 5/5 | 8/15 | 24/51 |
   | DeepSeek · A | 1/15 | 5/5 | 9/15 | 19/51 |
   | Sol · A | 12/15 | 5/5 | 2/15 | 46/51 |
   | Opus · A | 8/15 | 5/5 | 3/15 | 44/51 |

   The bare backend fails on some scenarios in every family, as the stage requires. Sol searches its memory 2–13 times a run
   and is near the ceiling in A; DeepSeek and Haiku almost never search and act on the first ten results. No knob was
   changed for this: the tuning target was met with the knobs as first set.
6. **Calibration for the projection:** all four arms on three developer scenarios (one per tier, class 1) for each
   family (`devfull`); cost per unit at 100 / 500 / 1,000 events: DeepSeek $0.12 / $0.17 / $0.23, Sol $0.14 / $0.33 /
   $0.50, Opus $0.50 / $0.81 / $1.17 (judging included).
7. **Fixes found on developer data, before the freeze:** a noise thread's move notice could fall before the task's
   day while its follow-up decision fell after, leaving a record that disagreed with the history (Sol rightly
   «corrected» two such records and was scored as interfering) — the follow-up now lands the same day; the noise's
   standing instruction no longer says a person «has moved on» (it contradicted later core e-mails); recipients match
   through the person–organisation pairs in the history's own sender lines; a message's `regarding` tag is not
   required; a message to a party named in a touched record is not unnecessary; the judge sees each value with the
   record and field it belongs to; an empty search no longer ends a unit; the layer's scope takes in everything one
   correction revokes once any of it is relevant; the writer spec asks for noise items that recur.
8. **The developer set** was written in this session (the planner's side, with three helper agents of the same
   family), never shown to the test writers; the test set is checked for overlap with it at the test freeze.

## Amendment before admission (2026-11-11 ≈ 00:50 UTC), the rater view
The first 97 ratings (34 candidates) were taken on a view of each candidate that listed the expected state's explicit
entries but not the parts implied by the marks: a consent request on every ASK record, and every KEEP record left as it
is. Astra read the missing consent requests as an omission («the expected state omits consent requests …») and marked
candidates «no» for it; the scorer requires those requests, so the view misstated the expected state. The raters were
stopped, the view now lists the implied entries, those 97 ratings are kept in each candidate's file as
`ratings_discarded_v1` (published, not used), and every candidate is rated afresh on the corrected view. Nothing the
writers see changed; the writers' prompts keep their hashes. The spec freeze was re-taken for this one change
(`pool3.py`; the earlier file's hash for it is in this commit's history).
