# Evaluation bench

Runs scripted play scenarios through the real turn path on a disposable PGlite
database and records per-turn metrics. Never touches the owner's database.

```sh
node scripts/eval/run.mjs --scenario all                 # all scenarios, fake provider
node scripts/eval/run.mjs --scenario 01-miller           # one scenario
node scripts/eval/run.mjs --scenario 01-miller,03-reward-once
node scripts/eval/run.mjs --scenario all --provider live --budget-usd 10   # paid, see docs/BASELINE.md
node scripts/eval/report.mjs <run-id>                    # table + medians for a finished run
node scripts/eval/probe-models.mjs --dry-run             # live DmModel probe; paid without --dry-run:
node scripts/eval/probe-models.mjs --budget-usd 2 [--models opus,astra] [--efforts medium,high] [--runs 2]
```

`probe-models.mjs` talks to both DmModel adapters directly (no game state): a
stable ~3.5k-token prefix, one local `roll` tool, three Russian player lines,
each model/effort twice so the second run reads the cache. It records time to
first word, turn time, tokens and cost per request and per turn in
`scripts/eval/out/probe-<time>.jsonl`, and never sends a request whose worst
case could exceed `--budget-usd`.

- Each scenario starts from a freshly created campaign (World → character
  creation → opening → configuration → Astra takeover), the same preparation
  as `tests/astra-freedom-fixture.mjs` (`takenOver`), with all migrations.
- **fake** (default): only the HTTP answer from OpenAI is replaced. The real
  provider (`src/lib/server/dm/astra-primary-provider.ts`), schema, parsing,
  validators, ordered effects, commit and memory maintenance all run. Each
  scripted answer must satisfy the strict JSON schema of the actual request,
  so it can only say what the live model could say. Timings are server-side
  only; token counts are byte estimates.
- **live**: real `gpt-6-astra` requests. `--budget-usd` is required; before
  every request the worst case is reserved and a request that could exceed the
  budget is never sent. Probe steps and scripted answers are skipped.
- Output: `scripts/eval/out/<run>.jsonl` (git-ignored): one `run` header, one
  line per turn/action, one `scenario` summary per scenario, one `end` line.

## Scenario format (`scenarios/*.json`)

```jsonc
{ "title": "...", "description": "...", "steps": [
  { "id": "accept", "say": "player input",
    "dice": [4],                          // optional forced d-values
    "probe": false,                       // probe = deliberate model misbehaviour (fake only)
    "model": { "note": "...", "plan": [ /* raw Astra decisions, in request order */ ],
               "narrate": { /* optional separate narrator answer */ } },
    "expect": [ { "npcExists": "miller" }, { "heroMoney": { "eq": 5 } } ] },
  { "id": "save", "action": "save", "name": "Before" },
  { "id": "load", "action": "load", "save": "Before" },
  { "id": "again", "action": "replay", "of": "accept" },
  { "id": "cm", "action": "characterModel", "model": { /* owner Character Model correction */ } }
] }
```

`model` may also be a list of candidates; the first whose placeholders resolve
is used. Placeholders: `{{hero}}`, `{{campaign}}`, `{{currentLocation}}`,
`{{npc:<regex>}}`, `{{entity:<regex>}}`, `{{location:<regex>}}`,
`{{quest:<regex>}}`, `{{heroItem:<regex>}}`, `{{npcItem:<regex>}}`,
`{{heroStorage}}`, `{{minutes}}`, `{{minutes+N}}`.

Checks (see `lib/state.mjs`): `outcome`, `responseMode`, `modelRequests`,
`npcExists`, `npcCount`, `npcCreatedThisTurn`, `sameNpcAs`, `questExists`,
`questCount`, `questCreatedThisTurn`, `heroMoney`, `heroMoneyDelta`,
`heroMoneySince`, `heroItem`, `heroItemDelta`, `heroItemCategory`,
`itemOwnedBy`, `effectsAccepted`, `narrationExcludes`, `noPublicLeak`,
`stateEquals`, `locationIs`.

A check may carry `"weakness": "W1"`: a known weakness from `docs/BASELINE.md`.
The report lists them separately as OPEN/CLOSED; they are expected to stay red
until the stage that closes them (W1 second payment via a gift — stage 3;
W2 paraphrased secret leak and W3 harmless private detail failing a turn — stage 2).
