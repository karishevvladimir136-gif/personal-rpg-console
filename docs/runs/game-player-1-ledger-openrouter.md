# Game player 1 — the OpenRouter ledger (the Claude models through OpenRouter)

Cap $90; spent before this run $0.0000; this run $0.0017; total $0.0017; 2 calls.

Every call's own line — with its door (`provider`), `upstream`, `servedModel`, request id and message id — is in the ledger's `.json`.

| Session | Purpose | Model | Provider (door) | Upstream | Served model | Calls | Input (uncached) | Cache read | Cache write | Output | USD | Errors | Refusals | 429 waits |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| probe | door probe 1 | claude-haiku-5-5 | openrouter | Claude Platform on AWS | claude-haiku-5-5 | 1 | 4 | 0 | 11357 | 33 | $0.0014 | 0 | 0 | 0 |
| probe | door probe 2 | claude-haiku-5-5 | openrouter | Claude Platform on AWS | claude-haiku-5-5 | 1 | 4 | 11357 | 0 | 286 | $0.0003 | 0 | 0 | 0 |
