# DM models — provider facts (Stage 1)

Checked on **2026-10-15** against the official documentation linked below. No paid calls were used for this
page. Re-check before relying on prices or limits for a live run.

## Claude Opus 5.5 — `claude-opus-5-5` (Anthropic Messages API)

Sources: [models overview](https://platform.claude.com/docs/en/about-claude/models/overview),
[structured outputs](https://platform.claude.com/docs/en/build-with-claude/structured-outputs.md),
[prompt caching](https://platform.claude.com/docs/en/build-with-claude/prompt-caching.md),
[effort](https://platform.claude.com/docs/en/build-with-claude/effort.md),
[streaming](https://platform.claude.com/docs/en/build-with-claude/streaming.md),
[errors](https://platform.claude.com/docs/en/api/errors.md),
[tool use](https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview).

| Topic | Fact |
| --- | --- |
| Endpoint | `POST https://api.anthropic.com/v1/messages`, headers `x-api-key`, `anthropic-version: 2023-06-01` |
| Context / output | 1M tokens context; 128K max output (synchronous API). `max_tokens` covers thinking + text |
| Thinking | Adaptive thinking is **always on**. `thinking: {type: "disabled"}` and `budget_tokens` return 400. Thinking text is omitted by default (`display: "omitted"`), but the blocks still arrive and are billed |
| Effort | `output_config.effort`: `low` / `medium` / `high` / `xhigh` / `max`. **Default `medium`** on this model. Changing top‑level effort between requests invalidates the prompt cache |
| Tool choice | `auto` (default) and `none` only. **Forced tool use (`any` / `tool`) returns 400** |
| Tools | `{name, description, input_schema, strict}`; parallel tool calls are on by default (several `tool_use` blocks in one message); all results go back in **one** user message as `tool_result` blocks (`tool_use_id`, `content`, `is_error`) |
| Thinking blocks in a tool loop | Every `thinking` / `redacted_thinking` block of the assistant turn must be sent back **unchanged** (with its signature). History must be **append‑only**: editing earlier turns invalidates replayed thinking blocks (400 on accounts created on/after 2026‑08‑31) |
| Strict tools (`strict: true`) | Schema keywords: types, `enum` (scalars only), `const`, `anyOf`, `allOf` (not with `$ref`), `$ref`/`$defs`, `default`, `required`, `additionalProperties: false` (required on every object), string `format`s, simple `pattern`, array `minItems` **0 or 1 only** |
| Strict — not supported | `minimum`/`maximum`/`multipleOf`, `minLength`/`maxLength`, **any `maxItems`**, other array constraints, recursive schemas, external `$ref`. Unsupported keywords → 400 |
| Strict — limits per request | **20** strict tools; **24** optional parameters (across all strict schemas); **16** parameters with union types (`anyOf` or type arrays like `["string","null"]`); internal "too complex" limit and a 180 s compile timeout. First use of a new schema compiles (cached 24 h) |
| Streaming (SSE) | `message_start` (message with initial `usage`) → per block `content_block_start` / `content_block_delta` (`text_delta`, `input_json_delta.partial_json`, `thinking_delta`, `signature_delta`) / `content_block_stop` → `message_delta` (`stop_reason`, **cumulative** `usage`) → `message_stop`. Any number of `ping` events. Mid‑stream errors arrive as `event: error` (e.g. `overloaded_error`) after an HTTP 200 |
| Stop reasons | `end_turn`, `max_tokens`, `stop_sequence`, `tool_use`, `pause_turn`, `refusal` (with `stop_details.category`) |
| Prompt caching | Explicit `cache_control: {type: "ephemeral"}` on blocks or automatic top‑level `cache_control`. Up to **4** breakpoints. TTL **5 min** default (refreshed on each hit) or `ttl: "1h"`; longer TTLs must come first. **Minimum cacheable prefix: 512 tokens** for Opus 5.5. Prefix order: `tools` → `system` → `messages`; any byte change invalidates everything after it |
| Usage fields | `input_tokens` (uncached remainder only), `cache_creation_input_tokens` (+ `cache_creation.ephemeral_5m_input_tokens` / `ephemeral_1h_input_tokens`), `cache_read_input_tokens`, `output_tokens` (includes thinking). Total input = input + cache read + cache write |
| Errors | 400 `invalid_request_error`, 401 `authentication_error`, 402 `billing_error`, 403 `permission_error`, 404 `not_found_error`, 409 `conflict_error`, 413 `request_too_large`, 429 `rate_limit_error`, 500 `api_error`, 504 `timeout_error`, 529 `overloaded_error`. Retry with backoff: 429 (honour `retry-after`; a tier spend‑cap 429 has no `retry-after` and does not recover), 500, 504, 529, connection errors. Do not retry 400/401/402/403/404/413. Response header `request-id` |
| Price per 1M tokens | input **$4**, 5‑min cache write **$5** (1.25×), 1‑h cache write **$8** (2×), cache read **$0.20** (0.05×), output **$20** |

Notes for our design:
- The plan's limit list is confirmed except one correction: strict schemas accept **no `maxItems` at all**
  (the plan said "no `maxItems` > 1"); only `minItems` 0 or 1 is allowed. Length and number bounds are
  checked by our server.
- The adapter must keep the provider's own assistant blocks (thinking with signatures, `tool_use`) and send
  them back unchanged on the next request of the same operation. The neutral history therefore carries an
  opaque provider payload per assistant message.
- Server‑side refusal fallbacks (`fallbacks` beta) would let another model finish a refused turn. We do not
  enable them: a turn's model is pinned to the operation, and a silent switch would break that pin and the
  cache. A refusal is reported as `stop: refusal`.
- Forced tool use is unavailable, so the turn loop (stage 2) must use `auto` and instructions, and must cope
  with the model answering without a tool call.

## GPT‑6 Astra — `gpt-6-astra` (OpenAI Responses API)

Sources: [model page](https://developers.openai.com/api/docs/models/gpt-6-astra),
[function calling](https://developers.openai.com/api/docs/guides/function-calling),
[structured outputs — supported schemas](https://developers.openai.com/api/docs/guides/structured-outputs),
[reasoning](https://developers.openai.com/api/docs/guides/reasoning),
[streaming](https://developers.openai.com/api/docs/guides/streaming-responses),
[streaming events reference](https://developers.openai.com/api/reference/resources/responses/streaming-events),
[prompt caching](https://developers.openai.com/api/docs/guides/prompt-caching),
[error codes](https://developers.openai.com/api/docs/guides/error-codes);
event and usage field names checked in the official SDK types
([openai-python `types/responses`](https://github.com/openai/openai-python/tree/main/src/openai/types/responses)).

| Topic | Fact |
| --- | --- |
| Endpoint | `POST https://api.openai.com/v1/responses` (also Chat Completions and Batch) |
| Context / output | 1,050,000 tokens context (922,000 max input); 128,000 max output. Prompts over 272K input tokens are billed at 2× input/cache and 1.5× output |
| Reasoning | `reasoning.effort`: `low` / `medium` / `high` / `xhigh` / `max` (`none` → 400). Default is not documented for this model; the current Astra path sends `high` (plan) and `medium` (narrator). `max_output_tokens` includes reasoning tokens; hitting it gives `status: "incomplete"`, `incomplete_details.reason: "max_output_tokens"` |
| Function tools | `{type: "function", name, description, parameters, strict}`. Output items `{type: "function_call", call_id, name, arguments (JSON string), id, status}`. Results go back as input items `{type: "function_call_output", call_id, output}` |
| Parallel calls | Allowed unless `parallel_tool_calls: false` ("zero or one tool"). `tool_choice`: `auto` (default), `required`, a named function, `allowed_tools`, `none` |
| Reasoning items | With `store: false`, reasoning items carry `encrypted_content`; they must be passed back together with the function call outputs (`include: ["reasoning.encrypted_content"]` is still accepted) |
| Strict schemas | All properties listed in `required`; optional fields as a union with `null` (e.g. `["string","null"]`); `additionalProperties: false` on every object; root must be an object without `anyOf`. Supported: `pattern`, `format`, `minimum`/`maximum`/`exclusive*`/`multipleOf`, `minItems`/`maxItems`, `anyOf`, `$defs`, recursion |
| Strict — not supported / limits | Not supported: `allOf`, `not`, `if`/`then`/`else`, `dependentRequired`, `dependentSchemas`. Limits: **5000** object properties, **10** nesting levels, **120,000** characters of names/enum/const values, **1000** enum values in total (a single enum over 250 values ≤ 15,000 chars). Guidance: fewer than ~20 functions per turn |
| Streaming (SSE) | `response.created`, `response.in_progress`, `response.output_item.added` / `.done`, `response.output_text.delta` (`item_id`, `output_index`, `content_index`, `delta`), `response.function_call_arguments.delta` / `.done` (`item_id`, `output_index`, `arguments`), `response.refusal.delta` / `.done`, reasoning summary events, then `response.completed` / `response.incomplete` / `response.failed` (full `response` incl. `usage`). Errors: `{type: "error", code, message, param, sequence_number}` |
| Usage fields | `input_tokens` (**includes** cached and cache‑write tokens), `input_tokens_details.cached_tokens`, `input_tokens_details.cache_write_tokens`, `output_tokens` (includes reasoning), `output_tokens_details.reasoning_tokens`, `total_tokens` |
| Prompt caching | Automatic from **1,024** tokens (GPT‑5.6 and later); optional explicit breakpoints; `prompt_cache_options.ttl` only `"30m"` (default); `prompt_cache_key` optional. Cache writes cost 1.25× input |
| Errors | Retry with backoff: 429 rate limit / `slow_down` (honour `Retry-After`), 500, 503 `server_is_overloaded`. Do not retry: 401, 403, 429 billing/quota codes (`credit_balance_exhausted`, `organization_spend_limit_exceeded`, `project_spend_limit_exceeded`, `organization_usage_limit_exceeded`) |
| Price per 1M tokens | input **$10**, cached input **$1**, cache write **$12.50**, output **$50** (Standard tier; Flex/Batch 50%, Fast 2×) |

## Live probe (Stage 1, 2026-10-15)

`node scripts/eval/probe-models.mjs --budget-usd 2` — toy DM loop through the new `DmModel` adapters:
stable prefix of 13,885 characters (3,530 real tokens on Astra), one local `roll(formula, reason)` tool, three short
Russian player lines (offer of work; sneaking to the barn; haggling), each model/effort played twice in a row,
`maxOutputTokens` 3000. Raw records: `scripts/eval/out/probe-20261015-075059.jsonl` (git-ignored).

**Claude Opus 5.5 — measured after a key fix** (second run, `--budget-usd 1.65 --models opus`; raw records
`scripts/eval/out/probe-20261015-164544.jsonl`; 18 paid requests, **$0.2173** in total). The first attempt was refused
with HTTP 401 because the key in `.env.local` had its `sk-ant-` prefix twice; the owner fixed it, and a free
`GET /v1/models/claude-opus-5-5` check (200; 1,000,000 input / 128,000 output tokens) preceded the paid run.

| Effort | Player turn | First word | Whole turn | Requests | Cost per turn |
| --- | --- | --- | --- | --- | --- |
| medium | no roll | 6.9 s cold, 2.9 s cached | 10.0 s cold, 5.8 s cached | 1 | $0.037 first (cache write), $0.009 cached |
| medium | with a roll | 7.6–10.8 s (= whole turn) | 7.6–10.8 s | 2 | $0.016–0.021 |
| high | no roll | 2.6–2.8 s | 6.3–6.7 s | 1 | $0.010 (prefix already cached) |
| high | with a roll | 9.0–11.5 s (= whole turn) | 9.0–11.5 s | 2 | $0.018–0.022 |

- Medians per turn: medium — first word 8.3 s, turn 9.1 s, $0.0177; high — first word 9.5 s, turn 9.5 s, $0.0180.
- The same prompt counts as **5,798 tokens on Opus vs 3,530 on Astra** (different tokenizer; tools render
  differently). Opus still costs the same or less per turn thanks to lower prices and the 5% cache-read rate.
- Caching: 95–96% of the second run's input was read from the cache; the tools+system prefix written during the
  medium runs was also read by the first high-effort request.
- **After a roll, Opus's reply arrived in one burst** at the end of the second request (first and last text 0–30 ms
  apart), so the player sees nothing for 7–11 s and then the whole paragraph. Astra streamed its post-roll text over
  ~4–5 s. Like Astra, Opus wrote no text before calling `roll`.
- Rolls were sensible (sneaking DC 12, haggling DC 15–20), never for plain conversation. Some roll reasons came back in
  English or mixed language, and the narration kept the name "Oswin" partly in Latin script ("Оswin") where Astra
  transliterated "Освин" — a prompt matter for Stage 4.

**Side by side (this probe):**

| | Opus medium | Opus high | Astra medium | Astra high |
| --- | --- | --- | --- | --- |
| First word, no roll (cached) | 2.9 s | 2.6–2.8 s | 1.4 s | 5.7 s |
| First word, with a roll | 7.6–10.8 s | 9.0–11.5 s | 3.8–5.3 s | 7.1–10.2 s |
| Whole turn, median | 9.1 s | 9.5 s | 8.5 s | 12.4 s |
| Cost per turn, median | $0.018 | $0.018 | $0.020 | $0.030 |

**GPT-6 Astra — measured** (20 paid requests, **$0.3422** in total):

| Effort | Player turn | First word | Whole turn | Requests | Cost per turn |
| --- | --- | --- | --- | --- | --- |
| medium | no roll (offer of work) | 1.4–2.2 s | 6.1–7.3 s | 1 | $0.052 first (cache write), $0.011 cached |
| medium | with a roll (sneak, haggle) | 3.8–5.3 s | 8.1–9.4 s | 2 | $0.018–0.021 |
| high | no roll | 5.7–8.4 s | 10.3–12.6 s | 1 | $0.061 first, $0.018 cached |
| high | with a roll | 7.1–10.2 s | 10.3–15.4 s | 2 | $0.029–0.032 |

- Medians per turn: medium — first word 4.2 s, turn 8.5 s, $0.0195; high — first word 7.8 s, turn 12.4 s, $0.0304.
- Caching works through the adapter: the second run read 96–97% of its input from the cache; the first request of a
  run writes the 3,530-token prefix once at $12.50/1M.
- Rolls: Astra called `roll` exactly where an uncertain outcome existed (sneaking DC 12, haggling DC 15–20), never for
  plain conversation, with sensible Russian reasons. Narration was natural Russian, within the length asked.
- With a roll, the first word arrives only after the roll round trip (~2–3.4 s for the tool request) — the turn loop in
  Stage 2 should stream a short line before or while a tool runs, or accept this latency.

Per-request numbers (tokens in / cache read / cache write / out / reasoning, cost) are in the JSONL file.

## Side by side

| | Claude Opus 5.5 | GPT‑6 Astra |
| --- | --- | --- |
| Input / output per 1M | $4 / $20 | $10 / $50 |
| Cache read / write per 1M | $0.20 / $5 (5 min) | $1 / $12.50 |
| Min cached prefix | 512 tokens | 1,024 tokens |
| Cache lifetime | 5 min (refreshed) or 1 h | 30 min |
| Effort levels | low … max, default medium | low … max, default not documented |
| Forced tool use | not available | available |
| Optional field in strict schema | leave out of `required` | keep in `required`, type `X \| null` |
| Number/length bounds in strict schema | not allowed | allowed |
| Our effort mapping (`DmModel`) | `low`→low, `medium`→medium, `high`→high, `max`→max | same names |

## Checked for Stage 2b (2026-10-15): effort changes and cache breakpoints

Sources: [effort](https://platform.claude.com/docs/en/build-with-claude/effort.md),
[prompt caching](https://platform.claude.com/docs/en/build-with-claude/prompt-caching.md),
[thinking](https://platform.claude.com/docs/en/build-with-claude/thinking.md);
[OpenAI prompt caching](https://developers.openai.com/api/docs/guides/prompt-caching),
[OpenAI reasoning](https://developers.openai.com/api/docs/guides/reasoning).

| Topic | Claude Opus 5.5 | GPT‑6 Astra |
| --- | --- | --- |
| Changing effort between requests | The top-level `output_config.effort` is rendered into the prompt: a change always invalidates the messages cache and, model-dependent, the tools/system cache ("treat any thinking or top-level effort change as starting the cache over"). Per-message effort (beta `mid-conversation-output-config-2026-07-01`, a `role: "system"` message with `output_config`) keeps the cache but **takes effect only from the next user turn with new input — a user turn of tool results does not count**, so it cannot lower the effort of a continuation inside a tool loop | `reasoning.effort` is part of the rendered prefix too. GPT-6 models accept a `{type: "configuration_update", reasoning: {effort}}` input item that changes the level from that point on while the request-level value (and the cached prefix) stays; never two adjacent updates; not with automatic compaction |
| Explicit cache breakpoints | `cache_control` on up to 4 blocks (we use 3 layers + the automatic one) | GPT-5.6 and later: `prompt_cache_breakpoint: {mode: "explicit"}` on an `input_text` block of an input message (not on the top-level `instructions`); up to 4 cache writes per request, the implicit breakpoint (end of the latest eligible message: a user message, the last of a group of tool outputs, the last of the initial developer messages) uses one of them. `prompt_cache_options.mode: "explicit"` turns the implicit one off |
| Cache key / retention | TTL 5 min (refreshed) or `ttl: "1h"` | `prompt_cache_key` optional on GPT-5.6+ (routing is automatic; the key separates accounting); `prompt_cache_options.ttl` only `"30m"` |
| Why Astra's first request of a turn read 0 cached tokens in Stage 2 | — | the only breakpoint was the implicit one after the player's input, so no earlier request shared that prefix; Stage 2b puts explicit breakpoints after each stable layer |
| Interleaved text and tool calls | Text and `tool_use` blocks in one assistant message; the continuation after `tool_result` is a new assistant message (joined by the loop) | A `message` item followed by `function_call` items in one response; the reasoning guide recommends a `phase: "commentary"` preamble before tool calls |

## Checked for Stage 4 (2026-10-16): does a change of effort keep the cache? (`scripts/eval/probe-depth.mjs`)

Records: `docs/runs/probe-depth-20261016-004049.jsonl` (top-level effort), `docs/runs/probe-depth-20261016-004520.jsonl`
(Astra anchored). One ~5 200-token stable prefix with the roll tool, one short player line per request, the effort
sequence medium → medium → high → high → medium → xhigh; cache read tokens of the input tokens per request.

| Step | Effort (after) | Opus 5.5, top-level `output_config.effort` | Astra, request-level `reasoning.effort` | Astra, request-level anchored at medium + `configuration_update` |
| --- | --- | --- | --- | --- |
| 1 | medium (–) | 0 / 8 173 (write 8 169) | 0 / 5 312 (write 5 309) | 5 309 / 5 312 (prefix already cached) |
| 2 | medium (medium) | 8 169 / 8 173 | 5 309 / 5 312 | — |
| 3 | high (medium) | **8 169 / 8 173** | **0 / 5 312** (write 5 309) | **5 309 / 5 312** |
| 4 | high (high) | 8 169 / 8 173 | 5 309 / 5 312 | 5 309 / 5 312 |
| 5 | medium (high) | 8 169 / 8 173 | 5 309 / 5 312 (the medium prefix was still cached) | 5 309 / 5 312 |
| 6 | xhigh (medium) | 8 169 / 8 173 | not sent (budget) | 5 309 / 5 312 |

- **Opus 5.5**: a top-level effort change between turns did **not** restart the system+tools cache (99.95 % reads at
  every step). The loop therefore sends the chosen depth as the top-level effort.
- **Astra**: the request-level effort is part of the cached prefix: a change wrote the whole prefix again (step 3,
  $0.089 instead of $0.015). With the request-level value anchored and the step's effort sent as a
  `configuration_update` item, every step read the cache. The loop pins the campaign's configured effort as
  `baseEffort` and asks for the scene's depth through the update (`pin.baseEffort`, `docs/TURN_LOOP.md` §10).
- First word at the same prefix: Opus 3.2–4.2 s at every level (xhigh: no text before the first tool call);
  Astra 2.2–3.1 s at medium, 9.7–10.9 s at high without the anchor and 3.1–4.2 s at high with it (the anchored
  high requests returned ≈ 200-token replies; the sample is three requests per cell, so take the speeds as
  indicative only). Spend: $0.19 + $0.08.
