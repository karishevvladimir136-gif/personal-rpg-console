# Stage 4 samples

`blind/` holds the blind-comparison samples (Stage 4 §10): six scenes × five model/effort variants, the same
scripted player inputs, 2–3 live turns each, written by `node scripts/eval/blind.mjs`. A file name is
`<scene>-<random>.json`; nothing in the name says which variant it is. Inside, each file carries the full
metadata: `variant` (provider, model ID, effort), per turn the input, the full narration, time to first word,
turn time, requests, the pinned effort and tension, tokens, cache read share, cost, the accepted and rejected
tool calls, the four prompt-layer hashes and the diagnostics; `totals` with the cost, committed and failed
turns and leaks. The planner builds the owner's blind rating page from these files; the owner never opens
them. The run's complete record is `docs/runs/<time>-blind.jsonl`.
