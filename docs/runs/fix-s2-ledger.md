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
| real-replay-20261020-102644 | AB | real replay: 4 turns × O on Fix run B probes (seed b); voice live; craft live | $11.27 | $3.3792 | yes |
| real-replay-20261020-103412 | AB | real replay: 2 turns × O on Fix run prep probes (seed p); voice live; craft live | $7.89 | $0.9467 | yes |
| real-replay-20261020-103924 | AB | real replay: 2 turns × O on Fix run probes (seed a); voice live; craft live | $6.95 | $2.1106 | yes |
| real-replay-20261020-110008 | AB | real replay: 1 turns × A on Fix run memory probe (seed m2, 60 turns); voice live; craft live | $2.70 | $0.0000 | yes |
| real-replay-20261020-110036 | AB | real replay: 1 turns × A on Fix run memory probe (seed m2, 60 turns); voice live; craft live | $4.50 | $0.9706 | yes |
| real-replay-20261020-124207 | D | real replay: 1 turns × O on Fix run B probes (seed b); voice live; craft live | $5.00 | $1.6561 | yes |
| real-replay-20261020-124524 | D | real replay: 1 turns × O on Fix run probes (seed a); voice live; craft live | $5.00 | $1.4154 | yes |
| picture-probe-20261020-134324 | E | fix run E: the frame rules on the live models (brief, picture, vision check) on synthetic scenes | $1.50 | $0.1972 | yes |
| picture-probe-20261020-134837 | E | fix run E: the frame rules on the live models (brief, picture, vision check) on synthetic scenes | $1.50 | $0.2322 | yes |
| frame-check-debug-20261020-135325 | E | fix run E: one raw vision-check call to see why its answer was unreadable (thinking used the 700-token cap) | $0.01 | $0.0005 | yes |
| picture-recheck-20261020-135348 | E | fix run E: the vision check again on the probe's frames (the token cap raised) | $0.10 | $0.0031 | yes |
| picture-shot-20261020-144551 | E | fix run E: the default frame path (shot, records frame, picture, check) on synthetic scenes | $0.50 | $0.0979 | yes |
| picture-shot-20261020-144908 | E | fix run E: the default frame path (shot, records frame, picture, check) on synthetic scenes | $0.40 | $0.0647 | yes |
| hero-probe-20261020-165543 | F | fix run F: the one-pass hero on the live DM (two synthetic descriptions) | $2.00 | $0.0000 | no |
| **Total** | | | **$31.8018 of $50** | |
