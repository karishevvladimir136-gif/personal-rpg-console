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
