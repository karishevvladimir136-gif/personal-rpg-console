# the merge after session 2 — the ledger of paid calls

Cap $15; every paid run registers here before its first request and settles when it ends (written by `scripts/eval/real-replay/lib/ledger.mjs`).

| Run | Stage | What | Reserved | Spent | Settled |
| --- | --- | --- | --- | --- | --- |
| 20261020-180119-loop-opus+opus-live-20-live2d-ford |  | check 1: the ford in «Opus пишет — Opus записывает» with both checks, attempt 1 (2 turns; stopped by the bench's own reservation bug, fixed) | $3.00 | $0.8527 | yes |
| 20261020-180617-loop-opus+opus-live-20-live2d-ford |  | check 1 + check 2: the ford in «Opus пишет — Opus записывает» with both checks (5 of 5 turns) | $3.00 | $1.4931 | yes |
| real-replay-20261020-181635 |  | real replay: 1 turns × O on Fix run probes (seed a); voice live; craft live | $1.50 | $0.0000 | yes |
| **Total** | | | **$2.3458 of $15** | |
