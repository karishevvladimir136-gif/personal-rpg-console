77 scenarios written by GLM 5.3 and Kimi K3 and admitted by a majority of Astra, Haiku and the other writer; histories
of 100, 500 and 1,000 events; a deterministic workplace with a silent consent map; scoring on the final state. Three
families × four arms × 77 scenarios × 2 repeats = **1,848 arm-runs**, plus **90 C-gold runs**. Spent **$239.96 of
$250**. Design, hashes and the developer data: `docs/runs/authority-3-freeze.md` / `-freeze-spec.json` / `-freeze.json`.
Pool: `docs/runs/authority-3-pool.md`. Dry run: `docs/runs/authority-3-dry-run.md`. Raw units:
`docs/runs/authority-3-units-<set>-<family>.jsonl.gz`. **77 scenarios are still a pilot for a claim this large.**

## In brief

- **The bench separates the arms on stale acts this time.** Bare Mem0 (A) acted on a superseded value in **25.6 %** of
  non-control runs (20–33 % by tier). The task's own search returned the change in only 68 of 154 scenario-repeats. The
  reviewer's rule therefore gives a verdict on stale actions, and the verdict is **lost**: C's rate is 23.6 %, not half
  of A's.
- **No arm wins end to end.** Success: A **20.1 %**, B 20.1 %, B′ 22.9 %, C **20.3 %**. C − A is +0.2 [−3.5, 4.3] and
  C − B is +0.2 [−3.2, 4.1]. **AU1 is lost on every line that needs a positive interval.** The two post-hoc readings
  (noise edits not counted; the unnecessary clause dropped) do not change this.
- **The pointed pass beat the inferred layer.** Propagation: A 67.6, B 75.6, **B′ 79.5**, C 72.0. B′ − B is
  **+3.8 [1.0, 7.0]**; C − B′ is **−7.5 [−11.2, −3.9]**. «If B′ reaches C, the structure is the instruction»: B′ went past
  C. On these histories the instruction alone did more than the inferred graph, at half C's cost per run ($0.074
  against $0.142).
- **The gold graph helps; the inferred one does not, even though its links are good.** At the 500 tier, propagation
  is A 71.9, C-gold **81.1**, C **71.7**: C keeps −3 % of C-gold's +9 gain (AU4 lost). Sol and Opus recover 93–98 % of
  the gold «rests on» links, and 98–100 % of the touched decisions are connected to the changed item. DeepSeek recovers
  86–89 % and finds the change's own «replaces» link in 41 % of runs (22 % at 1,000 events). Recall is 0.93 at 1,000
  events, so the «< 0.6» bet is lost too. *A reading, not a finding:* the inferred graphs are loose (precision 0.53–0.78).
  Many extra roots and decisions then compete for the layer's 30-decision walk and its marks, and C reaches its scope
  through Mem0's rewritten memories (deviation 9). C-gold has the same trace, but not the loose links.
- **Families.** DeepSeek gains most from the layer on propagation (C − A +11.5 points) but not end to end (−0.6).
  Opus's C − A on success is the **largest** at 1,000 events (+13.9) and not the smallest anywhere (AU6 lost). Sol in A
  already propagates 80 % by searching its own memory.
- **Boundary.** C asks on 60.8 % of ASK decisions (AU7 lost, as bet). B′ asks most (72.3 %). Acts without consent:
  C 9.7 % against A 7.1 % (AU3's second half lost). Unnecessary intervention: C 36.6 % against A 39.2 % (that half
  held).
- **Decision debt (AU8).** C − A on success goes from −5.7 at 100 events to +5.6 at 1,000. The difference, +11.3, has
  a lower bound of −0.0: it points the way the thesis says but is not separated from zero. On propagation the gap
  *narrows* with length (+8.7 to +4.8). Lost under the frozen rule.
- **What the data allow** (the reviewer's three criteria scored as she wrote them): on 77 foreign scenarios with
  long, noisy histories and an inferred graph, the structured layer did **not** improve end-to-end outcomes over the
  same backend or over a plain pass. It did **not** reduce stale actions, which now occur, and it slightly raised acts
  without consent. A pointed instruction to list dependent decisions did better than the inferred structure. The
  AUTHORITY_1/2 gain, which rested on supplied links, does not carry over when the links must be inferred from long
  histories: C-gold kept a +9-point gain over A, C kept none of it.
