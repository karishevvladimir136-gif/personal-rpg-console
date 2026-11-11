## Deviations and limits (read before the numbers)

1. **77 test scenarios, not 80.** The pool admitted 29 / 30 / 18 by tier; chains are short by one at 100 events and
   by two at 1,000. The rule is not relaxed and the gaps are not filled. So 154 units a family, not 160.
2. **Every family completed within the ceiling**: DeepSeek, Sol and Opus each ran 154 units, and C-gold ran 90.
   Sol ran beside DeepSeek, whose host was slow. Opus ran in three parts beside DeepSeek, each under a cap that kept
   back DeepSeek's projected remaining need. Tiers were interleaved, so a stop at any point would have left every tier
   covered.
3. **The ingestion amendment was read late** (posted 22:30 UTC, read 01:50 UTC) and **applied before any test-set
   subject call**. The developer table in the freeze notes was taken with the earlier backend (every event stored as
   written).
4. **The rater view was corrected before admission.** It now shows the consent requests and unchanged KEEP records that the marks imply. The 97 ratings taken
   earlier are published and unused.
5. **The raters barely agree.** κ ≈ 0 on every yes/no question and 0.81 on class. Astra said yes to 44 of 187, Haiku to
   105, the third vote to about 86. So admission was carried mostly by Haiku and the other writer, and many admitted
   scenarios carry an Astra «no» (her reasons are in the pool file). Human audit of the admitted set is the stage's
   named gap and is not done here.
6. **C's extraction runs without a thinking phase** where the endpoint allows it (Haiku, DeepSeek), and at the
   smallest setting where it does not (Sol, Opus). With thinking on, Haiku and DeepSeek spent the whole budget thinking
   on 1,000 events and returned no index (developer data). Every other subject call is at medium effort.
7. **Opus put tool arguments beside `args`** in 756 of its 5,264 tool calls, which touched about a third of its arm-runs
   evenly across arms. The frozen loop read those calls as empty and answered with an error or an empty search; Opus
   usually corrected itself on the next reply. Opus runs with at least one such call succeeded at 20–40 % against 24–26 % without.
   Opus's absolute rates are therefore somewhat low; the counts show no tilt between arms. DeepSeek did this 9 times,
   Sol never.
8. **The «unnecessary intervention» clause is strict by design**: any state change outside the frozen expected state
   counts. It catches three things that are not all fiddling:
   - edits to routine noise records, where the generator let two threads of the same routine item overlap in time and
     a careful reader «reconciled» one record with the other thread (a bench flaw);
   - status fields rewritten as notes («rescheduling — awaiting hotel confirmation»);
   - new follow-up records.
   The post-hoc table shows success with (1) noise edits not counted and (2) the clause dropped. Neither replaces the
   frozen measure.
9. **Mem0 rewrites the history**, so a retrieved memory has no event id. C's layer and the diagnostics trace each memory
   to the events of its batch with the most words in common. That trace is approximate, and C's scope depends on it.
10. **Three container restarts and one out-of-memory kill** (12 ingestion workers beside the dry run). Each step
    resumed from its last finished unit. Calls that were in flight at a restart are not in the ledger; they are a few
    cents of writer and rater calls. Orphaned workers from the killed ingestion were found and stopped.
11. **Spend checks before 01:49 UTC read this stage's spend from their own process only.** With raters and writers
    running in parallel, that understated the stage's spend by up to ≈ $12 and overstated the room. No check was near
    its limit. From 01:49 UTC every check reads the whole ledger.
12. **DeepSeek's host rate-limited us often.** Its HTTP 429s were waited out within the six-wait bound, but its
    latencies include those waits.
13. **One subject refusal** (Opus, A, first reply, the provider's refusal marker on a normal tool call). It was recorded,
    the run ended there, and nothing was rephrased; the breaker at three was never reached.
14. **Developer set and helpers.** The developer scenarios were written in this session with three helper agents of the
    Claude family. The test set's writers (GLM, Kimi) never saw them, and the overlap check found none.

## Notes on record

- **The owner** (#8, 2026-11-11 01:58 UTC): prioritise this stage; key topped up to $303.66; reserve for #6 only its
  remaining projected need ($95 + $30 from $2.21, less its spend on the key), not its ceiling; go on after the dry
  run's projection; the ceiling stays $250. Applied from 02:05 UTC (`authority-3-reserve-6.jsonl`; every check after
  that point measures #6's spend from the key's cumulative usage, which a top-up does not move). The owner gave no bets.
- **The reviewer's three criteria** (AU1–AU3), scored as written: end-to-end success over both controls is **lost**;
  stale-action reduction at a non-zero base rate is **lost** (base rate 25.6 %, so the bench separated the arms); the
  rise in unnecessary intervention is **held** (C below A), but acts without consent rose (C 9.7 % against A 7.1 %).
  Her hypothesis that «structure pays most on accessible models» is tested by AU6. DeepSeek, the most accessible
  family, gained most on propagation and nothing end to end; Opus gained most end to end at 1,000 events.
- **The planner's premise** («the inferred layer keeps ≥ 60 % of the supplied layer's gain; stale actions appear in A
  and the layer halves them; B′ closes half the gap; Opus gains least») is lost on every clause except «stale actions
  appear in A».
- **The amendments** (`1860392` ingestion, `e227502` AU8) are applied as written; the first was read late (deviation 3).
- **Owner acceptance is pending.** This report shows that the work is done; it does not show that the owner has
  accepted it.
- Named and not done here, as the stage says: the same SDK on DolphinBench's public tasks.
