# the merge after session 2 — the ledger of paid calls

Cap $15; every paid run registers here before its first request and settles when it ends (written by `scripts/eval/real-replay/lib/ledger.mjs`).

| Run | Stage | What | Reserved | Spent | Settled |
| --- | --- | --- | --- | --- | --- |
| 20261020-180119-loop-opus+opus-live-20-live2d-ford |  | check 1: the ford in «Opus пишет — Opus записывает» with both checks, attempt 1 (2 turns; stopped by the bench's own reservation bug, fixed) | $3.00 | $0.8527 | yes |
| 20261020-180617-loop-opus+opus-live-20-live2d-ford |  | check 1 + check 2: the ford in «Opus пишет — Opus записывает» with both checks (5 of 5 turns) | $3.00 | $1.4931 | yes |
| real-replay-20261020-181635 |  | real replay: 1 turns × O on Fix run probes (seed a); voice live; craft live | $1.50 | $0.0000 | yes |
| 20261020-181543-loop-opus+opus-live-21-live2d-lair |  | check 1: the lair in «Opus пишет — Opus записывает» with both checks (4 of 5 turns; the fifth stopped by the run's guard) | $3.00 | $1.9819 | yes |
| real-replay-20261020-182723 |  | real replay: 1 turns × O on Fix run probes (seed a); voice live; craft live | $3.00 | $1.5041 | yes |
| **Total** | | | **$5.8318 of $15** | |
