# DM architecture bake-off bench

The paid comparison of `docs/stages/DM_ARCH.md`: four variants of the DM on the Russian harbour replay
(`scripts/eval/scenarios/19-polish-ru-replay.json`), the same saved state per scene for every variant.

| Variant | Runtime | Writer | Bookkeeper |
| --- | --- | --- | --- |
| A | today's loop (`dm-loop-v1`) | Claude Opus 5.5, depth high … xhigh | — |
| B | today's loop | Claude Fable 5.1, depth high … xhigh | — |
| C | two-pass (`src/lib/gameplay/dm-loop/two-pass/`) | Claude Fable 5.1 | Claude Opus 5.5, high |
| D | two-pass | Claude Opus 5.5 | Claude Sonnet 5.5, high |

```sh
node --experimental-strip-types scripts/eval/dm-arch/reference.mjs --budget-usd 9        # A plays all 30 turns; a state dump before each
node --experimental-strip-types scripts/eval/dm-arch/scenes.mjs --variants B,C,D --budget-usd 12   # each scene from its saved state
node --experimental-strip-types scripts/eval/dm-arch/continuity.mjs --variant C --turns 8 --budget-usd 5
node --experimental-strip-types scripts/eval/dm-arch/judge.mjs --budget-usd 2            # Sonnet 5.5 compares records with narration
node --experimental-strip-types scripts/eval/dm-arch/samples.mjs                         # the owner's blind samples
node --experimental-strip-types scripts/eval/dm-arch/report.mjs                          # the tables
```

Every script takes `--dry` (stand-in models, no provider, nothing paid) and registers its budget in
`docs/runs/dmarch-ledger.json` before the first request: the whole bake-off stays under the cap there ($30), and a
request whose worst case would cross a run's budget is never sent (the loop bench's guard). Records go to
`docs/runs/dmarch-<time>-<kind>.jsonl` (one `run` line, one `turn` per player turn with the narration, the receipts,
the timings, the tokens, the cost, the split's phases and the writer's ledger, one `end` line). The saved states live in
`scripts/eval/out/dmarch-states/` (git-ignored, 8.7 MB each); `scenes.mjs` and `judge.mjs` skip what an earlier record
already holds, so a restarted session never pays twice.

Timings per turn: `firstWordMs` (first narration character from the harness's send), `textDoneMs` (the writer's
text complete: the two-pass writer's end, or the turn's end on the single loop), `recordsDoneMs` (the commit).
