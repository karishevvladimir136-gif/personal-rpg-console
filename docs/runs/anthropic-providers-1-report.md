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
  - `requestId` (Anthropic `request-id`, Bedrock `x-amzn-requestid`, or a generic `x-request-id`/`x-generation-id`);
  - who served the call: `servedModel` (the model the reply names, turned back into the app's id), `upstream`
    (OpenRouter's routed provider, when the reply names it) and `messageId` (on OpenRouter, the generation id);
  - `servedModelMatches`, the "served = requested" check, on every door.

  These are read from a clone of the reply, so the app's own reading is untouched. Ledger entries carry the door, and
  ledger tables print spend per door. The candidate has no self-talk or game-player harnesses, so their comparability
  notes are not on this branch; the stalled runs pick up the provider column from these ledgers when they resume.
- **Smoke tool.** `node scripts/eval/providers-smoke.mjs --door openrouter|bedrock` replaces `bedrock-smoke.mjs`. It
  uses its own ledger, `providers1`: $6 in total, with stage O (OpenRouter) and stage B (Bedrock) capped at $3 each.
  For OpenRouter it also reads each generation's record (free) to get OpenRouter's own charge and the upstream.
- **Docs.** `docs/CLOUD.md` gains the OpenRouter door and the two hosts the allowlist needs. `.env.example` (names only)
  and `docs/MODELS.md` are updated.

## Smoke — OpenRouter (the door for tomorrow)

**Not run: this environment's network policy denies `openrouter.ai`.** The proxy answers 403 to CONNECT, so no request
left the VM. $0 spent. The fix is the owner's: add `openrouter.ai` under Allowed domains in the `rpg-console`
environment, then run:

```
node scripts/eval/providers-smoke.mjs --door openrouter --budget-usd 3
```

That run makes one Haiku 5.5 call (ten tokens), then one Opus 5.5 DM turn through the app's own loop with the roll
check on Haiku 5.5, then one Fable 5.1 call (ten tokens). It records `upstream`, `servedModel`, the ids and the cost.

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

**OpenRouter.** It has no tier. Spend is limited by the prepaid credits; rate limits come from the upstream it routes
to. This will be measured on the smoke.

## Checks

The new and changed tests are in `tests/anthropic-providers-1.test.mjs` (renamed from `bedrock-provider-1`; 11
tests). They cover:
- each door's URL, headers (key presence only) and mapped ids;
- OpenRouter 402/429/401;
- Bedrock 429/403/404 and the recorded refusals;
- `servedModel`/`upstream` capture from a stream and from JSON, and served ≠ requested;
- spend per door;
- the endpoint walk.

Typecheck and zero-warning lint pass. The full suite and the build run on the final candidate; their numbers are in
`DEV_STATUS.md` and the final commit.

## Money

Bedrock: $0.000038. OpenRouter: $0 (blocked). Console: $0, with no calls.

## Next

1. The owner allows `openrouter.ai` in the environment, and the OpenRouter smoke runs (≤ $3).
2. The owner decides the order: his own table first (`ANTHROPIC_PROVIDER=openrouter` and `OPENROUTER_API_KEY` in
   `.env.local`), or the stalled runs, each resumed with `ANTHROPIC_PROVIDER=openrouter` and the provider column in its
   ledger.
3. Optional, the owner's call: if Bedrock should carry Opus before its 5.5 quotas open, it needs an InvokeModel
   transport. That is a separate stage, not done here.
