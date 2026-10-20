# the fix-s2 run — the ledger of paid calls

Cap $50 (stages A+B within $30); every paid run registers here before its first request and settles when it ends (written by `scripts/eval/real-replay/lib/ledger.mjs`).

| Run | Stage | What | Reserved | Spent | Settled |
| --- | --- | --- | --- | --- | --- |
| real-replay-20261020-080648 | AB | real replay: 4 turns × A on Fix run probes (seed a); voice live; craft live | $4.00 | $1.8935 | yes |
| real-replay-20261020-080918 | AB | real replay: 2 turns × A on Fix run probes (seed a); voice live; craft live | $8.00 | $1.4099 | yes |
| real-replay-20261020-081201 | AB | real replay: 4 turns × A on Fix run probes (seed a); voice live; craft live | $10.00 | $2.0139 | yes |
| real-replay-20261020-081650 | AB | real replay: 4 turns × A on Fix run probes (seed a); voice live; craft live | $10.00 | $1.9707 | yes |
| real-replay-20261020-082026 | AB | real replay: 4 turns × D on Fix run probes (seed a); voice live; craft live | $10.00 | $2.3927 | yes |
| real-replay-20261020-082708 | AB | real replay: 4 turns × O on Fix run probes (seed a); voice live; craft live | $12.00 | $2.9843 | yes |
| real-replay-20261020-083351 | AB | real replay: 2 turns × A on Fix run probes (seed a); voice live; craft live | $8.00 | $1.1681 | yes |
| real-replay-20261020-083844 | AB | real replay: 2 turns × A on Fix run probes (seed a); voice live; craft live | $8.00 | $0.6949 | yes |
| cut-probe-20261020-084303 | AB | fix run A1: the cut → continue path on the live provider (small caps) | $0.60 | $0.0000 | yes |
| cut-probe-20261020-084311 | AB | fix run A1: the cut → continue path on the live provider (small caps) | $2.00 | $0.4317 | yes |
| ledger-recheck-20261020-085021 | AB | fix run A6: the ledger checker with the records' state over the stage A probe records | $0.20 | $0.0107 | yes |
| ledger-cases-20261020-085149 | AB | fix run A6: the ledger checker on session 2's known misses (synthetic) and controls | $0.10 | $0.0023 | yes |
| prep-probe-20261020-101619 | AB | fix run B1: a fresh campaign's prep (the hidden layer) on Opus 5.5 at high | $3.00 | $0.4331 | yes |
| real-replay-20261020-101759 | AB | real replay: 4 turns × O on Fix run B probes (seed b); voice live; craft live | $12.00 | $3.3218 | yes |
| real-replay-20261020-102644 | AB | real replay: 4 turns × O on Fix run B probes (seed b); voice live; craft live | $11.27 | $0.0000 | no |
| **Total** | | | **$30.0000 of $50** | |
