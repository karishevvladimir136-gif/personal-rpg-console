# DM architecture bake-off — blind samples

One file per scene × variant of `docs/stages/DM_ARCH.md`: the same saved state before the turn for every variant, one
turn each, the player's input and the full narration as the player saw it (the writer's ledger is never in a sample).
The file name carries no hint of the variant; the variant (writer, bookkeeper, effort), the timings, the tokens, the
cost and the accepted records are inside each file, so the planner can build the owner's blind page and reveal the
letters afterwards. 32 samples over 8 scenes. Rebuilt by
`node scripts/eval/dm-arch/samples.mjs` from the records in `docs/runs/dmarch-*.jsonl`.
