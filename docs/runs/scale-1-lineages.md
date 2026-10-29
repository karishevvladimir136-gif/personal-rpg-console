# Scale 1 — lineages with base and instruct weights on OpenRouter

Checked 2026-10-29T09:09:53.735Z by `scripts/persona-emotions/scale-1-lineages.mjs` (record `scale-1-lineages.json`). A checkpoint is hosted only when
OpenRouter lists at least one endpoint for it. Every id that names the checkpoint was checked; a size with no public base release is marked.

**Verdict: 0 lineages with both (none) — fewer than two: stop and report (the stage's rule).**

| Lineage | Size | Base ids → hosting | Instruct ids → hosting | Both hosted |
| --- | --- | --- | --- | --- |
| Qwen3 | 0.6B | `qwen/qwen3-0.6b-base` → not in catalog | `qwen/qwen3-0.6b` → not in catalog<br>`qwen/qwen3-0.6b-04-28` → listed, no host | no |
| Qwen3 | 1.7B | `qwen/qwen3-1.7b-base` → not in catalog | `qwen/qwen3-1.7b` → listed, no host | no |
| Qwen3 | 4B | `qwen/qwen3-4b-base` → not in catalog | `qwen/qwen3-4b` → listed, no host<br>`qwen/qwen3-4b:free` → listed, no host | no |
| Qwen3 | 8B | `qwen/qwen3-8b-base` → not in catalog | `qwen/qwen3-8b` → listed, no host<br>`qwen/qwen3-8b:free` → listed, no host | no |
| Qwen3 | 14B | `qwen/qwen3-14b-base` → not in catalog | `qwen/qwen3-14b` → hosted: NextBit (int4), DeepInfra (fp8) | no |
| Qwen3 | 30B-A3B | `qwen/qwen3-30b-a3b-base` → not in catalog | `qwen/qwen3-30b-a3b` → hosted: DeepInfra (fp8)<br>`qwen/qwen3-30b-a3b-instruct-2507` → hosted: DekaLLM (unknown), SiliconFlow (fp8), Nebius (fp8) | no |
| Qwen3 | 32B | – (no public base release) | `qwen/qwen3-32b` → hosted: DeepInfra (fp8), SiliconFlow (fp8) | no |
| Qwen3 | 235B-A22B | `qwen/qwen3-235b-a22b-base` → not in catalog (no public base release) | `qwen/qwen3-235b-a22b` → listed, no host<br>`qwen/qwen3-235b-a22b-2507` → hosted: GMICloud (fp8), DeepInfra (fp8), Parasail (fp8), Venice (fp8) | no |
| Llama 3.x | 3 8B | `meta-llama/llama-3-8b` → listed, no host | `meta-llama/llama-3-8b-instruct` → listed, no host | no |
| Llama 3.x | 3 70B | `meta-llama/llama-3-70b` → listed, no host | `meta-llama/llama-3-70b-instruct` → listed, no host | no |
| Llama 3.x | 3.1 8B | `meta-llama/llama-3.1-8b` → not in catalog | `meta-llama/llama-3.1-8b-instruct` → hosted: DeepInfra (fp8), Novita (fp8), Groq (unknown), Cloudflare (fp8), CoreWeave (bf16) | no |
| Llama 3.x | 3.1 70B | `meta-llama/llama-3.1-70b` → not in catalog | `meta-llama/llama-3.1-70b-instruct` → hosted: DeepInfra (fp8), Amazon Bedrock (unknown) | no |
| Llama 3.x | 3.1 405B | `meta-llama/llama-3.1-405b` → listed, no host<br>`meta-llama/llama-3.1-405b:free` → listed, no host | `meta-llama/llama-3.1-405b-instruct` → listed, no host | no |
| Llama 3.x | 3.2 1B | `meta-llama/llama-3.2-1b` → not in catalog | `meta-llama/llama-3.2-1b-instruct` → hosted: Cloudflare (unknown) | no |
| Llama 3.x | 3.2 3B | `meta-llama/llama-3.2-3b` → not in catalog | `meta-llama/llama-3.2-3b-instruct` → hosted: Parasail (bf16), Cloudflare (unknown) | no |
| Llama 3.x | 3.3 70B | – (no public base release) | `meta-llama/llama-3.3-70b-instruct` → hosted: DeepInfra (fp8), Novita (bf16), AkashML (fp8), Parasail (fp8), Cloudflare (fp8), SambaNova (unknown), Groq (unknown), CoreWeave (fp16), Google (unknown), Google (unknown) | no |
| Mistral | 7B | `mistralai/mistral-7b` → not in catalog<br>`mistralai/mistral-7b-v0.1` → not in catalog | `mistralai/mistral-7b-instruct` → listed, no host<br>`mistralai/mistral-7b-instruct-v0.1` → listed, no host<br>`mistralai/mistral-7b-instruct-v0.3` → listed, no host | no |
| Mistral | Mixtral 8x7B | `mistralai/mixtral-8x7b` → not in catalog | `mistralai/mixtral-8x7b-instruct` → listed, no host | no |
| Mistral | Mixtral 8x22B | `mistralai/mixtral-8x22b` → listed, no host | `mistralai/mixtral-8x22b-instruct` → hosted: Mistral (unknown), Mistral (unknown), Mistral (unknown) | no |
| Mistral | Nemo 12B | `mistralai/mistral-nemo-base-2407` → not in catalog | `mistralai/mistral-nemo` → hosted: Io Net (fp16), DekaLLM (fp8), DeepInfra (fp8), Parasail (fp8), Mistral (unknown) | no |
| Mistral | Small 3 24B | `mistralai/mistral-small-24b-base-2501` → not in catalog | `mistralai/mistral-small-24b-instruct-2501` → hosted: DeepInfra (fp8) | no |
| DeepSeek V3 | V3 671B-A37B | `deepseek/deepseek-v3-base` → listed, no host<br>`deepseek/deepseek-v3-base:free` → listed, no host | `deepseek/deepseek-chat` → hosted: DeepInfra (fp4), StreamLake (unknown), DeepInfra (fp4)<br>`deepseek/deepseek-chat-v3-0324` → hosted: SiliconFlow (fp8), GMICloud (fp8) | no |
| DeepSeek V3 | V3.1 671B-A37B | `deepseek/deepseek-v3.1-base` → listed, no host | `deepseek/deepseek-chat-v3.1` → hosted: DeepInfra (fp4), SiliconFlow (fp8), CoreWeave (fp8), Mara (unknown), SambaNova (fp8)<br>`deepseek/deepseek-v3.1-terminus` → hosted: SiliconFlow (fp8), StreamLake (unknown) | no |

**The catalog:** 457 models listed; ids or names with a base / pretrained marker: none.
**Spend check (free GET):** $128.32 of OpenRouter credit left; this stage's spend $0 of $30.
**Routing probe with the key** (1-token completion on each base id the catalog names): `meta-llama/llama-3-8b` → HTTP 404 «meta-llama/llama-3-8b is no longer available on OpenRouter: no provider serves this model anymore. Use meta-llama/llama-3.1-8b-instruct instead.»; `meta-llama/llama-3-70b` → HTTP 404 «meta-llama/llama-3-70b is no longer available on OpenRouter: no provider serves this model anymore. Use meta-llama/llama-3.3-70b-instruct instead.»; `meta-llama/llama-3.1-405b` → HTTP 404 «meta-llama/llama-3.1-405b is no longer available on OpenRouter: no provider serves this model anymore. See available models at https://openrouter.ai/models»; `meta-llama/llama-3.1-405b:free` → HTTP 404 «meta-llama/llama-3.1-405b:free is no longer available on OpenRouter: no provider serves this model anymore. See available models at https://openrouter.ai/models»; `mistralai/mixtral-8x22b` → HTTP 404 «mistralai/mixtral-8x22b is no longer available on OpenRouter: no provider serves this model anymore. See available models at https://openrouter.ai/models»; `deepseek/deepseek-v3-base` → HTTP 404 «deepseek/deepseek-v3-base is no longer available on OpenRouter: no provider serves this model anymore. See available models at https://openrouter.ai/models»; `deepseek/deepseek-v3-base:free` → HTTP 404 «deepseek/deepseek-v3-base:free is no longer available on OpenRouter: no provider serves this model anymore. See available models at https://openrouter.ai/models»; `deepseek/deepseek-v3.1-base` → HTTP 404 «deepseek/deepseek-v3.1-base is no longer available on OpenRouter: no provider serves this model anymore. See available models at https://openrouter.ai/models». Charged: $0.0000.

No host is pinned: there is no lineage to pin one for. Hosted instruct checkpoints are listed so a later stage can pin them if base weights return.
