# Research records of paid runs

From Stage 4 on, no paid run is thrown away. Every live bench run, probe and blind-sample run writes one record here
(JSON Lines, one object per line). Synthetic campaigns only; never the owner's real campaigns. No keys, no owner data.

| File | Written by | Holds |
| --- | --- | --- |
| `<time>-loop-<model>-live-<scenarios>.jsonl` | `node scripts/eval/run.mjs --runtime dm-loop-v1 --provider live …` | the run header (model, effort, commit), one `turn` record per player turn (input, full narration, every tool receipt, diagnostics, the pinned depth, the four prompt-layer hashes and token counts, timings, tokens, cost), one `scenario` summary (checks, metrics, dossier budgets, leaks) and the `end` line (spend) |
| `<time>-blind.jsonl` | `node scripts/eval/blind.mjs --budget-usd N` | the same records for every scene × variant of the blind comparison; the samples themselves are in `docs/samples/stage-4/blind/` |
| `probe-depth-<time>.jsonl` | `node scripts/eval/probe-depth.mjs` | one request per effort step: cache read/write tokens, first word, cost (Stage 4 §7: does an effort change keep the cache) |
| `probe-<time>.jsonl` | `node scripts/eval/probe-models.mjs` | the per-effort speed probe (first word, turn time, cost, cache share) |

`node scripts/eval/recompute.mjs docs/runs/<file>.jsonl` prints the run's report again and recomputes the resistance
metrics from the receipts in the record; they must match the stored per-scenario metrics.
`node scripts/eval/report.mjs docs/runs/<file>.jsonl [--calls]` prints the report or every paid call.
