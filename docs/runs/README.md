# Research records of paid runs

From Stage 4 on, no paid run is thrown away. Every live bench run, probe and blind-sample run writes one record here
(JSON Lines, one object per line). Synthetic campaigns only; never the owner's real campaigns. No keys, no owner data.

| File | Written by | Holds |
| --- | --- | --- |
| `<time>-loop-<model>-live-<scenarios>.jsonl` | `node scripts/eval/run.mjs --runtime dm-loop-v1 --provider live …` | the run header (model, effort, commit), one `turn` record per player turn (input, full narration, every tool receipt, diagnostics, the pinned depth, the four prompt-layer hashes and token counts, timings, tokens, cost), one `scenario` summary (checks, metrics, dossier budgets, leaks) and the `end` line (spend) |
| `<time>-blind.jsonl` | `node scripts/eval/blind.mjs --budget-usd N` | the same records for every scene × variant of the blind comparison; the samples themselves are in `docs/samples/stage-4/blind/` |
| `probe-depth-<time>.jsonl` | `node scripts/eval/probe-depth.mjs` | one request per effort step: cache read/write tokens, first word, cost (Stage 4 §7: does an effort change keep the cache) |
| `probe-<time>.jsonl` | `node scripts/eval/probe-models.mjs` | the per-effort speed probe (first word, turn time, cost, cache share) |

| `game-player-1-run-<time>.json`, `game-player-1-transcripts/*.md`, `game-player-1-report.md`, `game-player-1-ledger.md` / `-ledger-openai.md` (and `.json`), `game-player-1-dry-run.md` | `node --experimental-transform-types scripts/game-player-1/run.mjs --go` (`--dry`, `--prereport`, `--score <run.json>`) | a model at the app's own table as a player (GAME_PLAYER_1): per session the player-visible screens and the player's messages, the turns (kind, roll cards and presses, the public changes, the place), the welfare checks, the note; the blind tags and the verdicts; every paid call on two ledgers with its request id. Nothing of the DM's private state (the hidden layer's size only) |
| `music-review/*.json`, `music-ledger.json` / `.md`, `music-session-log.md` | `node scripts/music-bench.mjs compare|pack`, `node scripts/music-session-log.mjs` | the music stage: every fal music request (prompt, model, seed, price, time, the measured length, loudness and seam), the review MP3s in `music-review/`, the ledger of every paid call, the 20-turn mood log |

`node scripts/eval/recompute.mjs docs/runs/<file>.jsonl` prints the run's report again and recomputes the resistance
metrics from the receipts in the record; they must match the stored per-scenario metrics.
`node scripts/eval/report.mjs docs/runs/<file>.jsonl [--calls]` prints the report or every paid call.

Files ending in `.partial.jsonl` are runs that did not reach their `end` line: the first live run of the Stage 4
scenarios on 2026-10-16 (the harness stopped on a scenario step that assumed a name the live DM had not used; the
Opus run of the same scenarios was stopped by hand after the first scenario once the inputs were seen to assume
things the fixture's opening scene does not contain). Their paid turns are kept here all the same.
