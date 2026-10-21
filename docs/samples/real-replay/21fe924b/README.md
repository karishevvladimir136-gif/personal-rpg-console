# Real replay — the memory pair of fix-s3-pre 2.6 («Fix run memory probe (seed s3, 60 turns)», synthetic)

The synthetic campaign's recall probe (a fact told once, 35 turns back: where Агафья Шкиперша hid the spare key) played
by «Opus пишет — Opus записывает» with «Память ведущего» компактно vs стандарт. One file per run; the variant, the
timings, the tokens, the cost and the accepted records are inside each file. Written by
`node scripts/eval/real-replay/replay.mjs`; the records are `docs/runs/real-replay-20261021-024834.jsonl` (compact,
cold cache), `…-024954.jsonl` (standard, warm), `…-025143.jsonl` (compact, warm); `…-024927.jsonl` is the standard arm's
first attempt, stopped by the replay's budget guard after one paid request. The results: `docs/RESEARCH_LOG.md`,
`docs/runs/fix-s3-pre-report.md` 2.6.
