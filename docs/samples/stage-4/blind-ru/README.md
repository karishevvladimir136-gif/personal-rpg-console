# Russian blind samples

The owner's 10-minute blind test (`docs/stages/BLIND_RU.md`): six scenes × four variants (`opus-high`, `opus-xhigh`,
`astra-high`, `astra-xhigh`), played in Russian on the Russian campaign fixture
(`scripts/eval/scenarios/blind-ru/campaign.json`: the English bench campaign with the same facts in Russian) with
short informal Russian player lines, written by `node scripts/eval/blind.mjs --lang ru --budget-usd N`.

Each file is `<scene>-<random>.json`; nothing in the name says which variant it is. The schema is the English one
(`../README.md`) plus `language: "ru"` and `keyStep`: the whole scene is played, but the owner's page shows only the
key turn — `tavern-talk` t3, `companion-heart` h2, `secret-pressure` p3, `power-creep` obey, `combat-climax` c2,
`travel-consequences` travel. The run's full record (every turn, receipts, and one `language` line per sample saying
whether its key turn is fully Russian) is `docs/runs/<time>-blind-ru.jsonl`.

## Run of 2026-10-16 (`docs/runs/20261016-044101-blind-ru.jsonl`)

24 samples (6 scenes × 4 variants), 68 live turns, every turn committed, no failed turn, no leak; the secret
scene's «secret not revealed» checks passed in all four variants. Spend $10.47 under a $13.14 cap; with the
language probe before it ($0.86, the three `docs/runs/20261016-043*-blind-ru-probe.jsonl` records) the whole test
cost $11.32 of the $14 budget. By variant: Astra high $3.15, Astra xhigh $3.26, Opus high $1.70, Opus xhigh $2.36.

All 24 key-turn narrations are Russian (no Latin-script word). In the game master's own records, one key turn
(`travel-consequences-160590`, the travel turn) wrote «без потери HP» in a private counter note; across all 68 turns
four records used «HP» or «NPC» this way. Names the player gave (Тамсин, Марроу-Форд) kept their spelling.
Observed, not changed here: when Opus pauses a turn for an interactive roll, the continuation after the roll often
has tool calls but no text, so the key turn's narration can stop before the roll's outcome (the English run shows
the same).
