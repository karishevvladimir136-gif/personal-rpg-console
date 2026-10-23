# the fixes from the owner's acceptance pass — the ledger of paid calls

Cap $15 (stages G within $0.5; stages V within $2; stages B within $2.5; stages D within $4; stages A within $3; stages I within $3); every paid run registers here before its first request and settles when it ends (written by `scripts/eval/real-replay/lib/ledger.mjs`).

| Run | Stage | What | Reserved | Spent | Settled |
| --- | --- | --- | --- | --- | --- |
| fix-s3-accept-d-region-2026-10-23T03:46 | D | Д3 region probe: DM prep (Opus 5.5) → picture (GPT Image 2.5) → check (Sonnet 5.5), synthetic | $1.50 | $0.0000 | yes |
| fix-s3-accept-d-region-2026-10-23T04:27 | D | Д3 region probe: DM prep (claude-opus-5) → picture (GPT Image 2.5) → check (claude-sonnet-5), synthetic | $1.50 | $0.0490 | yes |
| fix-s3-accept-d-diagnose-2026-10-23T04:29 | D | Д3 prep refusal diagnosis (claude-opus-5) | $0.30 | $0.0824 | yes |
| fix-s3-accept-d-region-2026-10-23T04:31 | D | Д3 region probe: DM prep (claude-opus-5) → picture (GPT Image 2.5) → check (claude-sonnet-5), synthetic | $1.50 | $0.1230 | yes |
| fix-s3-accept-b-probe-2026-10-23T04-33-00-600Z | B | Block Б probe: the scene sheet on 3 Russian places (claude-sonnet-5) and one redo of an English sheet (claude-haiku-5-5); text only | $0.50 | $0.0368 | yes |
| fix-s3-accept-d-check-variants-2026-10-23T04:34 | D | Д3 region check: fractions vs pixels (claude-sonnet-5), prep v1 picture | $0.20 | $0.0121 | yes |
| fix-s3-accept-d-check-variants-2026-10-23T04:35 | D | Д3 region check: fractions vs pixels (claude-sonnet-5), prep v1 picture | $0.20 | $0.0144 | yes |
| fix-s3-accept-d-region-2026-10-23T04:35 | D | Д3 region probe: DM prep (claude-opus-5) → picture (GPT Image 2.5) → check (claude-sonnet-5), synthetic | $1.50 | $0.0490 | yes |
| fix-s3-accept-d-diagnose-2026-10-23T04:35 | D | Д3 prep refusal diagnosis (claude-opus-5) | $0.30 | $0.0490 | yes |
| fix-s3-accept-d-region-2026-10-23T04:38 | D | Д3 region probe: DM prep (claude-opus-5) → picture (GPT Image 2.5) → check (claude-sonnet-5), synthetic | $1.20 | $0.0120 | yes |
| fix-s3-accept-d-region-2026-10-23T04:38-b | D | Д3 region probe: DM prep (claude-opus-5) → picture (GPT Image 2.5) → check (claude-sonnet-5), synthetic | $1.20 | $0.0195 | yes |
| fix-s3-accept-d-region-2026-10-23T04:40 | D | Д3 region probe: DM prep (claude-opus-5) → picture (GPT Image 2.5) → check (claude-sonnet-5), synthetic | $1.20 | $0.0111 | yes |
| fix-s3-accept-d-region-2026-10-23T04:41 | D | Д3 region probe: DM prep (claude-opus-5) → picture (GPT Image 2.5) → check (claude-sonnet-5), synthetic | $1.20 | $0.0163 | yes |
| fix-s3-accept-d-diagnose-2026-10-23T04:42 | D | Д3 prep refusal diagnosis (claude-opus-5) | $0.30 | $0.0380 | yes |
| fix-s3-accept-d-diagnose-2026-10-23T04:42-b | D | Д3 prep refusal diagnosis (claude-opus-5, no private notes) | $0.30 | $0.0154 | yes |
| fix-s3-accept-d-sanity-2026-10-23T04:42 | D | Д3 prep model sanity (claude-opus-5) | $0.15 | $0.0088 | yes |
| fix-s3-accept-d-bisect-2026-10-23T04:43 | D | Д3 prep refusal bisect (claude-opus-5) | $0.40 | $0.0623 | yes |
| fix-s3-accept-d-sanity-2026-10-23T04:43 | D | Д3 prep model sanity (claude-opus-5) | $0.15 | $0.0292 | yes |
| fix-s3-accept-d-region-2026-10-23T04:44 | D | Д3 region probe: DM prep (claude-opus-5) → picture (GPT Image 2.5) → check (claude-sonnet-5), synthetic | $1.20 | $0.1123 | yes |
| access-check-2026-10-23T05 | I | Model access check after the key question: one 1-token message each to claude-opus-5-5 (10 in / 1 out) and claude-sonnet-5-5 (10 in / 1 out), both HTTP 200 | $0.01 | $0.0001 | yes |
| fix-s3-accept-b-probe-2026-10-23T04-59-26-620Z | B | Block Б probe: the scene sheet on 3 Russian places (claude-sonnet-5-5) and one redo of an English sheet (claude-haiku-5-5); text only | $0.50 | $0.0366 | yes |
| fix-s3-accept-d-region-2026-10-23T05:00:00 | D | Д3 region probe: DM prep (claude-opus-5-5) → picture (GPT Image 2.5) → check (claude-sonnet-5-5), synthetic | $1.20 | $0.0905 | yes |
| fix-s3-accept-v-spells-2026-10-23T05:02:20 | V | В1 spell pictures: Огненный шар, Щит (gpt-image-2.5-sunburst, the spell composition), no database | $0.30 | $0.1076 | yes |
| **Total** | | | **$0.9754 of $15** | |
