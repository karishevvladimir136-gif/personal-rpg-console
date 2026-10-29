# Scale 1 — base vs instruct within a lineage: report (stopped at step 1)

Stage `docs/stages/SCALE_1.md` (on `origin/claude/handoff`, with the 2026-10-29 02:05 amendment: the owner's «да» for
an overnight run, which stops only if the dry run fails its own checks or **the lineage table has fewer than two
lineages with both base and instruct**). Branch `claude/scale-1` from `origin/claude/persona-solitude-2`. Checked
2026-10-29 09:09 UTC.

## In plain words

**The run did not start, because OpenRouter hosts no base models.** Every candidate lineage has hosted instruct
weights, but not one base checkpoint is served. The base ids that OpenRouter still lists (DeepSeek V3 and V3.1 base,
Llama 3 8B and 70B, Llama 3.1 405B, Mixtral 8x22B) have no host. A 1-token request to each, sent with our key, came
back HTTP 404 «no provider serves this model anymore». The other base ids (all Qwen3 bases, Llama 3.1 8B and 70B,
Llama 3.2, Mistral 7B, Nemo, Small 3) aren't in the catalog at all. In the whole catalog (457 models), no id or name is
marked base or pretrained. So 0 lineages have both base and instruct (the stage needs at least 2): **stop and report**,
as the amendment says. **Spent: $0.**

## The lineage table

Full table, every id checked: `docs/runs/scale-1-lineages.md`. Record: `docs/runs/scale-1-lineages.json`. Script:
`scripts/persona-emotions/scale-1-lineages.mjs` (free GETs, then a $0 routing probe).

| Lineage | Base weights on OpenRouter | Instruct weights on OpenRouter (hosts) | Both |
| --- | --- | --- | --- |
| Qwen3 | none: no `*-base` id in the catalog (Qwen released no base at 32B or 235B) | 14B (DeepInfra, NextBit), 30B-A3B (DeepInfra; 2507: SiliconFlow, Nebius, DekaLLM), 32B (DeepInfra, SiliconFlow), 235B-A22B 2507 (DeepInfra, Parasail, GMICloud, Venice); 0.6B–8B listed but unhosted | **no** |
| Llama 3.x | 3 8B, 3 70B, 3.1 405B: listed, no host (404); 3.1 8B/70B, 3.2 1B/3B: not in the catalog | 3.1 8B (5 hosts), 3.1 70B (DeepInfra, Bedrock), 3.2 1B/3B, 3.3 70B (10 hosts); 3 8B/70B and 3.1 405B unhosted | **no** |
| Mistral | Mixtral 8x22B: listed, no host (404); 7B, 8x7B, Nemo, Small 3: not in the catalog | Mixtral 8x22B (Mistral), Nemo (5 hosts), Small 3 (DeepInfra); 7B and 8x7B unhosted | **no** |
| DeepSeek V3 | V3 base and V3.1 base: listed, no host (404) | V3 `deepseek-chat` (DeepInfra fp4, StreamLake), V3 0324 (SiliconFlow, GMICloud), V3.1 (5 hosts) | **no** |

**Pinned hosts: none.** There is no lineage to pin a host for. The hosted instruct checkpoints are in the table so a
later stage can pin them if base weights come back.

**Not substituted, by the stage's rule:**
- Nous's Hermes 3 (Llama 3.1 70B and 405B) and Hermes 4 405B are hosted, but they are a third party's post-training.
  They are not a base, and not the lineage's own instruct.
- Running an instruct checkpoint through raw text completion is still post-trained weights, not a base.

## What was and was not done

| Step | Status |
| --- | --- |
| 1. Lineage table (both weights, ≥ 2 sizes, hosts pinned), committed | **done. 0 lineages with both → stop** |
| 2. Spend check | done: $128.32 of OpenRouter credit left on the shared key; this stage spent $0 of $30 (OpenAI $0 of $0) |
| 2. Protocol check per checkpoint; harness documentation | not done: no base checkpoint to run either on |
| 3. SC1–SC5 frozen (sha256) | not done: there are no checkpoints to freeze against. The stage's bets stand as written, untouched |
| 4. Dry run (smallest base + instruct twin); S1/S2/S3 rooms | not done. No paid call to any model |
| 5. Scoring, SC1–SC5 held/lost, spend by lineage | not applicable. Null result for the run: **not run**, which is not the same as «no emergence» |

## What would let SCALE_1 run (the owner's choice; nothing here was tried)

1. **A host that serves base weights for raw-text completion.** It would need a new domain in the environment's
   allowed list and the owner's word on a key and a cap. OpenRouter has none today.
2. **Self-hosted base checkpoints.** For example: Qwen3 Base 0.6B–14B, or Llama 3.1 8B base beside its instruct twin.
   Better still, **OLMo**, whose published intermediate checkpoints would let «training stage» be measured
   step by step, not only before and after. This means a rented GPU and a harness that talks to it. It is a different
   setup from this stage's.

## Verification

`tests/scale-1-lineages.test.mjs` passes 3 of 3 (no network). Lint with zero warnings passes on the new files.
Typecheck and `next build` pass. The full suite was not run: this change adds one standalone script, its test and
documents, and touches no app code.
