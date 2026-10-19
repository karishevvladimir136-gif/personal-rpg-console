# Real replay — blind tests on the owner's own story (polish 3 §4)

Every future blind test of the DM (the writer choice, the voice stage's A/B, the craft-set ablation) runs on the
owner's real states with the line he actually typed, so the move always fits the world.

- **The snapshot.** At every committed loop turn the server saves the state the turn started from (the runtime source:
  the public snapshot, the runtime state, the private DM state, the pinned craft) with the player's input and the
  campaign's rules of the moment (limits, depth, the split), gzip-compressed, in `rpg_private.turn_snapshots`
  (migration 68). Owner-only (`GET /api/campaigns/<id>/snapshots`, `?turn=N`, `?operationId=…`); never shown to the DM
  or the player; pruned by the DM setting `snapshotsKeep` (null: keep all). Turns played before migration 68 — session 1
  among them — are read from the turn row's own claim-time source (`rpg_private.turns.source`, kept since the phase 2
  runtime), the same state uncompressed, so they replay too.
- **The tool.** `replay.mjs` reads the snapshots through the app's server (the sandbox on `:3100`; `:3000` is refused
  unless `RPG_TEST_ALLOW_OWNER_PORT=1`), restores each into an isolated in-memory copy (`src/lib/gameplay/replay/`;
  nothing is written back), plays the owner's own line with each variant — `A` today's loop on Opus, `C` Fable + Opus,
  `D` Opus + Sonnet, `Dm` Opus + Sonnet at medium, `live` the campaign's own choice — the dice fixed per state, and
  writes blind samples in the bake-off's JSON shape to `docs/samples/real-replay/<campaign>/` (the variant inside, the
  file name silent, the real previous exchange as `before`). A cost line is printed before a paid run; the guard and the
  stage's ledger (`docs/runs/polish3-ledger.json`, cap $20) stop it. `--craft live|all|none|session1` picks the craft set
  (§7's ablation).

```sh
node scripts/eval/real-replay/replay.mjs --base http://127.0.0.1:3100 --campaign <id> --turns 5,8,12 --variants A,C,D --budget-usd 6
node scripts/eval/real-replay/synthetic.mjs --out scripts/eval/out/synthetic-snapshots.json          # a synthetic campaign's snapshots
node scripts/eval/real-replay/replay.mjs --snapshots scripts/eval/out/synthetic-snapshots.json --turns 1,2 --variants A,D --dry
```

Faithfulness: the copy plays on the same shadow-state validators and tools as the app; the SQL commit's own checks
(the timeline fence, the revision) do not run, so a record the database would refuse is not caught here — the samples
measure the prose, the timings and the records as proposed. Session 1's turns replay from their claim-time source,
which is exactly what the DM saw that turn (the memory retrieval rows excepted: a replay runs without the memory index,
on the state and the canon alone).
