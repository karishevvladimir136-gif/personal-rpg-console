# Anthropic providers 1 — report

Stage: `docs/stages/ANTHROPIC_PROVIDERS_1.md` (on `claude/handoff`; it was BEDROCK_PROVIDER_1). Branch
`claude/anthropic-providers-1` from `origin/claude/s3-candidate` (`be4b315`). It carries the earlier session's
BEDROCK_PROVIDER_1 commit (`c80dbfb`, the Console + Bedrock helper) and adds the third door on top.

**No call went to `api.anthropic.com`.** This session's `.env.local` had no `ANTHROPIC_API_KEY`, and each smoke sends
its requests through a guard that refuses every host except its own door.

## What changed

- **One switch, three doors.** `ANTHROPIC_PROVIDER` = `anthropic` (the default), `bedrock` or `openrouter`. The only
  place that knows the door is `src/lib/server/anthropic-endpoint.ts`; the scripts use the mirror
  `scripts/eval/lib/anthropic-endpoint.mjs`.

  | Door | Messages URL | Key | Model ids |
  | --- | --- | --- | --- |
  | `anthropic` | `https://api.anthropic.com/v1/messages` | `ANTHROPIC_API_KEY` in `x-api-key` | unchanged |
  | `bedrock` | `https://bedrock-runtime.<AWS_REGION>.amazonaws.com/anthropic/v1/messages` | `BEDROCK_API_KEY` in `x-api-key` | `global.anthropic.claude-opus-5-5`, …; the 4.5 generation by its dated ids (`global.anthropic.claude-haiku-4-5-20251001-v1:0`) |
  | `openrouter` | `https://openrouter.ai/api/v1/messages` | `OPENROUTER_API_KEY` as `Authorization: Bearer` | `anthropic/claude-opus-5.5`, `…fable-5.1`, `…sonnet-5.5`, `…haiku-5.5`, `…opus-4.5`, `…haiku-4.5` |

  `anthropic-version` is sent on every door. The ids the app shows and stores do not change: the map is applied at
  the transport, so a campaign saved with `claude-opus-5-5` plays on any door. A door that is not set up, or a model
  the door does not serve, is `not_configured`, and the message names the model.
- **No hard-coded endpoint is left.** The 21 sites (12 in `src`, 9 in `scripts/eval`) go through the helper. A test
  walks `src` and `scripts` and allows `api.anthropic.com`, `amazonaws.com` and `openrouter.ai` only in the helper.
  It also checks that no file reads a Claude key except through the door.
- **Errors.**
  - OpenRouter, HTTP 402 (no credits left): the turn stops with "insufficient credits — top up the OpenRouter
    account". It is never retried.
  - OpenRouter, HTTP 429: the existing bounded wait (it honours `retry-after`).
  - Bedrock `ThrottlingException`: the bounded wait.
  - Bedrock, a refused model (403) or a model its Messages endpoint does not serve (404): `not_configured`, named,
    never retried.
  - The `enforced_spend_limit_reached` rule stays the Console's only.
- **Provenance.** Every harness call line and every turn record's `calls[]` carries:
  - `provider` and `endpointHost`;
  - `requestId` (Anthropic `request-id`, Bedrock `x-amzn-requestid`, OpenRouter's generation id from its
    `request-id`/`x-generation-id` header, or a generic `x-request-id`);
  - who served the call: `servedModel` (the model the reply names, turned back into the app's id), `upstream`
    (OpenRouter's routed provider, from the reply's `provider` field) and `messageId` (the upstream's own message id);
  - `servedModelMatches`, the "served = requested" check, on every door.

  These are read from a clone of the reply, so the app's own reading is untouched. Ledger entries carry the door, and
  ledger tables print spend per door. The candidate has no self-talk or game-player harnesses, so their comparability
  notes are not on this branch; the stalled runs pick up the provider column from these ledgers when they resume.
- **Smoke tool.** `node scripts/eval/providers-smoke.mjs --door openrouter|bedrock` replaces `bedrock-smoke.mjs`. It
  uses its own ledger, `providers1`: $6 in total, with stage O (OpenRouter) and stage B (Bedrock) capped at $3 each.
  For OpenRouter it also reads each generation's record (free) to get OpenRouter's own charge and the upstream.
  `--charges <record>` repeats that lookup for a finished record.
- **Docs.** `docs/CLOUD.md` gains the OpenRouter door and the two hosts the allowlist needs. `.env.example` (names only)
  and `docs/MODELS.md` are updated.

## Smoke — OpenRouter (the door for tomorrow)

At first the environment's network policy denied `openrouter.ai`. The owner allowed it mid-session, and the smoke then
ran with `node scripts/eval/providers-smoke.mjs --door openrouter --budget-usd 3`. In the cloud, Node reaches the host
only with `NODE_USE_ENV_PROXY=1` (now in `docs/CLOUD.md`). The key's free status call showed $100 of credits, $0 used
and no key limit.

| # | Call | Result | Upstream | Generation id (`request-id`) | Cost |
| --- | --- | --- | --- | --- | --- |
| 1 | Haiku 5.5, 10 tokens (the roll check's shape: no thinking, effort low) | HTTP 200, "Ready", served `claude-haiku-5-5` = requested | Claude Platform on AWS | `gen-1792915577-wFPxcAg3Mts8PU4WL49a` | $0.000004 |
| 2 | **Opus 5.5 DM turn**, effort high, through the app's own loop on a throwaway PGlite campaign | **committed** in 43.5 s, first word at 22.1 s; 2 Opus requests + 1 roll check | — | — | $0.317285 |
| 2a | ↳ Opus request 1 | HTTP 200, served `claude-opus-5-5` = requested; 30,188 in (30,184 written to the cache, 28,242 of them for 1 h), 2,738 out | Claude Platform on AWS | `gen-1792915585-4NaSnmj5LKy9YjXeJsmK` | $0.290422 |
| 2b | ↳ roll check (Haiku 5.5) | HTTP 200, served `claude-haiku-5-5`; no error; 0 rolls this turn, 1 undeclared | Claude Platform on AWS | `gen-1792915620-VDfKjsDO0TelxHaZ2HZz` | $0.000121 |
| 2c | ↳ Opus request 2 | HTTP 200, served `claude-opus-5-5` = requested; 33,430 in, **30,184 read from the cache**, 230 out | Claude Platform on AWS | `gen-1792915622-g0pakUtDmCAhwDhNogez` | $0.026863 |
| 3 | Fable 5.1, 10 tokens (effort low) | HTTP 200, "Ready", served `claude-fable-5-1` = requested | Anthropic | `gen-1792915628-YK2UuPeL2yYVMgREEEjs` | $0.000420 |

**Total charged by OpenRouter: $0.317830.** Its own generation records give the same figure as Anthropic's list
prices; no markup showed on these calls.

What the smoke settled:
- **Path and headers.** The messages path is `/api/v1/messages`, the stage's expectation. A bearer key works; I did
  not try `x-api-key`, since one working form is enough and the helper keeps it. `anthropic-version` is accepted.
- **The app's Messages body passes through unchanged.** That covers streaming, tools, `output_config.effort`, the
  prompt-cache breakpoints with the 1-hour lifetime (written on request 1, read on request 2),
  `thinking: {type: "disabled"}` on Haiku, and adaptive thinking on Fable.
- **Ids.** OpenRouter's `request-id` (and `x-generation-id`) header is its generation id, `gen-…`, and the harness
  records it as `requestId`. The reply's own `id` is the upstream's message id, `msg_…`, recorded as `messageId`.
- **Upstream.** The stream's `message_start` names it in `provider`, and every call line stores it. OpenRouter routed
  Opus 5.5 and Haiku 5.5 to **Claude Platform on AWS** and Fable 5.1 to **Anthropic**. The upstream can differ per
  model and per call; the cache still hit within the turn.
- **Served model.** It matched the requested model on all five calls. OpenRouter's records name the dated snapshots:
  `claude-opus-5.5-20260921`, `claude-haiku-5.5-20261007`, `claude-fable-5.1-20260831`.

Records: `docs/runs/anthropic-providers-1-smoke-openrouter.json` (calls, headers, upstreams, OpenRouter's generation
records) and `…-openrouter.jsonl` (the turn record: narration, tools, receipts, `calls[]` with provider, upstream and
served model).

## Smoke — Amazon Bedrock (us-west-1, 4.5 generation only)

| # | Call | Result | Request id | Cost |
| --- | --- | --- | --- | --- |
| 1 | Haiku 4.5, 10 tokens | HTTP 200, "Ready.", served `claude-haiku-4-5` = requested; message `msg_bdrk_ix72…` | `98d833f5-27a0-44f1-9590-cdb7ac0a5a06` | $0.000038 |
| 2 | Opus 4.5, 10 tokens | HTTP 404 `not_found_error`: "The model doesn't exist or doesn't support this API" | `d3945dbf-8a1d-436f-9b60-576904712953` | $0 |
| — | Opus 4.5 DM turn | not possible on this door (see below) | — | — |
| — | Fable 5.1 | not run (the retention mode is not confirmed set) | — | — |

Free probes (an empty `messages` list is refused before any inference) mapped what the account can use on this
endpoint today:
- **Served:** Haiku 4.5, by its dated id only.
- **Refused, 403 "not available for this account":** the 5.5 models (`global.anthropic.claude-{opus-5-5,
  sonnet-5-5,haiku-5-5,fable-5-1}`).
- **Not on this API, 404:** Opus 4.5 and Sonnet 4.5 (`global.`/`us.`/bare). The same Opus 4.5 id is accepted by
  Bedrock's **InvokeModel** API (`/model/<id>/invoke`).

So **an Opus 4.5 DM turn cannot go through this door.** The door speaks the Messages API only, and Bedrock serves Opus
4.5 only through InvokeModel, which has another body and an AWS binary event stream. The app's DM and in-turn checks
are also written for the 5.5 models: they send `output_config.effort`, which Haiku 4.5 rejects, and adaptive thinking.
Bedrock becomes a full door when the 5.5 quotas open; until then it serves only Haiku 4.5. Records:
`docs/runs/anthropic-providers-1-smoke-bedrock.json` and the ledger `docs/runs/anthropic-providers-1-ledger.md`.

## Quotas

**Bedrock (us-west-1).** The responses carried no rate-limit or quota headers, only `x-amzn-requestid`. A Bedrock API
key cannot read Service Quotas. The 5.5 models are refused outright, which matches the 0 TPM the stage reports for
Opus 5.5, Sonnet 5.5, Haiku 5.5 and Fable 5.1.

Four parallel tables need about 100k output tokens a minute on Opus 5.5. AWS counts output tokens against the
tokens-per-minute quota at a higher burn-down rate for recent Claude models (5×), so that is at least 500k TPM for
output alone, plus input. Where to raise it:
1. Service Quotas → Amazon Bedrock → search "Claude Opus 5.5".
2. Raise the global cross-region "tokens per minute" quota to at least 2M (the default Anthropic cites) and the
   "requests per minute" quota.
3. Do the same for Claude Haiku 5.5, which runs the in-turn checks.
AWS shows the exact quota names on that page.

**OpenRouter.** It has no tier. The key has no limit of its own, and its status call reports no request limit (the
field is deprecated). Spend is limited by the prepaid credits ($100; $0.32 used by this smoke). Rate limits come from
the upstream it routes to, and none were met here: no 429, and no rate-limit headers on the replies. A turn with a
cold cache cost $0.32; a warm turn's requests cost about $0.03 each. Four parallel tables have not been tried on this
door.

## Checks

The new and changed tests are in `tests/anthropic-providers-1.test.mjs` (renamed from `bedrock-provider-1`; 11
tests). They cover:
- each door's URL, headers (key presence only) and mapped ids;
- OpenRouter 402/429/401;
- Bedrock 429/403/404 and the recorded refusals;
- `servedModel`/`upstream` capture from a stream and from JSON, and served ≠ requested;
- spend per door;
- the endpoint walk.

**Results.**
- **Full suite:** run on a clean worktree with no `.env.local`, at `--test-concurrency=2`: 2,937 tests, 2,910 passed,
  0 failed, 27 skipped. The candidate had 2,926; the difference is the 11 new tests.
- **After the suite ran,** the only changes were comments, the smoke script and docs. The provider tests, which
  include the endpoint walk, passed again on the final commit (11/11).
- **Typecheck, zero-warning lint and `next build`** pass on `de5d9e3`.

## Money

| Door | Spent | Cap |
| --- | --- | --- |
| OpenRouter | $0.3178 (charged by OpenRouter, the same as list prices) | $3 |
| Bedrock | $0.000038 | $3 |
| Console | $0, with no calls | — |

Ledger: `docs/runs/anthropic-providers-1-ledger.md`. The ledger table rounds to four places, so it shows Bedrock as
$0.0000.

## Next

1. The owner decides the order: his own table first (`ANTHROPIC_PROVIDER=openrouter` and `OPENROUTER_API_KEY` in
   `.env.local`), or the stalled runs, each resumed with `ANTHROPIC_PROVIDER=openrouter` and the provider column in its
   ledger.
2. Optional, the owner's call: if Bedrock should carry Opus before its 5.5 quotas open, it needs an InvokeModel
   transport. That is a separate stage, not done here.
