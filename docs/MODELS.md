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
