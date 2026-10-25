# the Anthropic providers stage (O = OpenRouter, B = Amazon Bedrock) — the ledger of paid calls

Cap $6 (stages O within $3; stages B within $3); every paid run registers here before its first request and settles when it ends (written by `scripts/eval/real-replay/lib/ledger.mjs`).

| Run | Stage | What | Reserved | Spent | Settled |
| --- | --- | --- | --- | --- | --- |
| anthropic-providers-1-bedrock-2026-10-25T07-55-15 | B | smoke on Amazon Bedrock (us-west-1): Haiku 4.5 call + Opus 4.5 call | $3.00 | $0.0000 | yes |
| **Total** | | | **$0.0000 of $6** | |

Spend per door: bedrock $0.0000
