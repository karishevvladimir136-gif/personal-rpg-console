# the fixes from the owner's acceptance pass — the ledger of paid calls

Cap $15 (stages G within $0.5; stages V within $2; stages B within $2.5; stages D within $4; stages A within $3; stages I within $3); every paid run registers here before its first request and settles when it ends (written by `scripts/eval/real-replay/lib/ledger.mjs`).

| Run | Stage | What | Reserved | Spent | Settled |
| --- | --- | --- | --- | --- | --- |
| fix-s3-accept-b-probe-2026-10-23T04-33-00-600Z | B | Block Б probe: the scene sheet on 3 Russian places (claude-sonnet-5) and one redo of an English sheet (claude-haiku-5-5); text only | $0.50 | $0.0368 | yes |
| access-check-2026-10-23T05 | I | Model access check after the key question: one 1-token message each to claude-opus-5-5 (10 in / 1 out) and claude-sonnet-5-5 (10 in / 1 out), both HTTP 200 | $0.01 | $0.0001 | yes |
| **Total** | | | **$0.0369 of $15** | |
