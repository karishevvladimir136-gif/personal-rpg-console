# Anthropic providers 1 — the same Claude models through three doors (Console, Bedrock, OpenRouter)

The owner's organisation on the Claude Console hit its monthly spend cap on 2026-10-25 05:28 UTC (the Start tier,
$500/month; access returns 2026-11-01 00:00 UTC; the tier is raised by Anthropic's sales form, not by paying more).
Three runs stopped in the middle (GAME_PLAYER_1 Table B, GAME_PLAYER_2, the X1 judges) and the owner cannot play his own
table. Two other doors serve the same models through an **Anthropic-compatible endpoint** — the same Messages API, the same
request and response bodies: **Amazon Bedrock** (billed through AWS, AWS token-per-minute quotas; the owner's new account
has Opus 4.5 / Haiku 4.5 today and 0 on the 5.5 models until it has history) and **OpenRouter** (an Anthropic reseller:
all of Opus 5.5, Fable 5.1, Sonnet 5.5, Haiku 5.5 at list prices, prepaid credits, no tier; base URL
`https://openrouter.ai/api`, the key as a bearer token). This stage makes the app and the research harnesses able to use
any of the three with one switch, and records which door every paid call went through.

Cloud session (`docs/CLOUD.md`, environment `rpg-console`, **Opus 5.5, ultracode off**), branch
**`claude/anthropic-providers-1`** from `origin/claude/s3-candidate`. Nothing to `main`. **Paid calls in this stage: at most
$6** (the smoke tests below, ≤ $3 per door), only against Bedrock and OpenRouter; no call to `api.anthropic.com` (it is
capped). Report in English `docs/runs/anthropic-providers-1-report.md`; talk to the owner in English, briefly. Suite green on a clean worktree,
typecheck, zero-warning lint.

## What Bedrock gives (from the AWS model cards, read 2026-10-24)
- Endpoint: `https://bedrock-runtime.<region>.amazonaws.com/anthropic` — Messages API under it (`/v1/messages`), the
  key sent as the Anthropic SDK sends it (`x-api-key`), the key being a **Bedrock API key** (bearer token); the
  region comes from `AWS_REGION` (the owner's is `us-west-1`; `us-east-1` in the AWS samples is only an example).
- Model ids: `global.anthropic.claude-opus-5-5`, `global.anthropic.claude-fable-5-1`, `global.anthropic.claude-sonnet-5-5`,
  `global.anthropic.claude-haiku-5-5` (the `us.` geo profiles are the alternative; bare ids are not served in US regions).
- Fable 5.1 on Bedrock requires the account's data-retention mode set to `aws_review` first (the owner's decision,
  made in the AWS console, not by the session); its classifiers return `stop_reason: "refusal"` with HTTP 200 — the
  harness's existing refusal rule covers this.
- Not supported there: `count_tokens`, priority/flex/batch service tiers. Prompt caching works as on the API.

## The change (small on purpose)
1. **One place that knows the door.** `src/lib/server/anthropic-endpoint.ts` (and a mirror for scripts,
   `scripts/eval/lib/anthropic-endpoint.mjs`): reads `ANTHROPIC_PROVIDER` (`anthropic` | `bedrock` | `openrouter`, default
   `anthropic`), returns `{ baseUrl, apiKey, modelId(name), providerLabel }`. For `anthropic`: `https://api.anthropic.com`,
   `ANTHROPIC_API_KEY`, ids unchanged. For `bedrock`: `https://bedrock-runtime.${AWS_REGION}.amazonaws.com/anthropic` (`AWS_REGION` required when the provider is bedrock; `not_configured` without it),
   `BEDROCK_API_KEY`, and the id map `claude-opus-5-5 → global.anthropic.claude-opus-5-5` (likewise fable-5-1,
   sonnet-5-5, haiku-5-5, and the 4.5 generation: opus-4-5, sonnet-4-5, haiku-4-5); an unmapped id throws `not_configured` with the id in the message. For `openrouter`: `https://openrouter.ai/api`,
   `OPENROUTER_API_KEY` sent as `Authorization: Bearer …` (and, if their Anthropic-compatible path also accepts
   `x-api-key`, that too — the smoke decides and the helper keeps the one that works), ids mapped
   `claude-opus-5-5 → anthropic/claude-opus-5.5` (likewise fable-5.1, sonnet-5.5, haiku-5.5, opus-4.5, haiku-4.5), and
   the messages path confirmed by the smoke (`/v1/messages` under the base URL is the expectation; if OpenRouter's
   Anthropic-compatible input lives elsewhere, the helper carries the path per provider). The `anthropic-version`
   header stays on every door.
2. **Every hard-coded `https://api.anthropic.com/v1/messages` goes through it** — nineteen sites on the candidate
   (`src/lib/server/dm/model/anthropic.ts`, `dm/anthropic-structured.ts`, `dm-loop/{ledger-check,note-fold,quotable,roll-check}.ts`,
   `live2d/server/{region-vision,region,battle,scenes}.ts`, `scripts/eval/**`), found with
   `git grep -n "api.anthropic.com"`; zero left afterwards (a test asserts it over `src` and `scripts`). The model ids
   the app shows and stores (`dm-settings-client.ts`, campaign settings) do **not** change: the map is applied at
   the transport, so a campaign saved with `claude-opus-5-5` plays on either door.
3. **Keys and names.** In the cloud: `APP_BEDROCK_API_KEY`, `APP_AWS_REGION`, `APP_OPENROUTER_API_KEY` and `APP_ANTHROPIC_PROVIDER` join `APP_ANTHROPIC_API_KEY`
   in the `rpg-console` environment; the session start writes `BEDROCK_API_KEY`, `AWS_REGION`, `OPENROUTER_API_KEY` and `ANTHROPIC_PROVIDER` into
   `.env.local` from them (`docs/CLOUD.md` step 3 updated). Never `BEDROCK_API_KEY` in Claude Code's own environment,
   never printed, never committed. On the owner's machine the same two lines in `.env.local`, pasted by him.
4. **Provenance.** Every ledger line and run record written by the harnesses (`money.calls[]`) gains `provider`
   (`anthropic` | `bedrock` | `openrouter`), `endpointHost`, and — where the door reports it — `upstream` (OpenRouter's
   response says which provider served the call; store it) and `servedModel`; the request-id capture reads Bedrock's
   (`x-amzn-requestid`) and OpenRouter's ids as well as Anthropic's. The existing «served model = requested model» check
   runs on every door. Reports print spend per provider. The self-talk and game-player
   reports' comparability notes say which door each arm used.
4b. **Booking by door, never by shape.** Every call is booked to the ledger of the door it went through (`provider`),
   never by the response's shape or the model's family: an OpenRouter call to an Anthropic model lands on the
   OpenRouter ledger, not the Anthropic one and never the OpenAI one. Test: a `provider=openrouter` call cannot land on
   the OpenAI ledger. (The 2026-10-25 02:10 stop in GAME_PLAYER_2's rerun — $9.63 booked to OpenAI in 8 turns — turned
   out to be a price-table bug, `gpt-6.1-sol` mangled to `gpt-6-1-sol` and billed at the worst-case rate; real spend
   $0.62; fixed with a regression test there. The cap stopped the run correctly on a phantom; this rule is the
   planner's first, wrong guess at the cause, kept because it is right on its own.)
5. **Error mapping.** Bedrock's throttling (HTTP 429 `ThrottlingException`) is a rate limit → the existing bounded
   wait; its `AccessDeniedException` on a model (access not granted, or Fable without `aws_review`) → `not_configured`
   with the model named, never retried; the `enforced_spend_limit_reached` pattern stays Anthropic-only; OpenRouter's «insufficient credits» (HTTP 402)
   → stop and report, never retried; its 429 → the bounded wait.

## Tests (no live calls)
Recorded fixtures: a Messages request through the helper for each provider asserts the URL, the headers (no key value
in any assertion), the mapped model id; the error mapping for the three Bedrock errors; the «no hard-coded endpoint»
grep test; the ledger line carries `provider`. The owner's existing tests must not change meaning: where a test
stubs `fetch` and checks the URL, it now checks the helper's URL for `anthropic`.

## Smoke (the only paid part, ≤ $3 per door)
**Quotas as of 2026-10-25 00:20:** the account is new; AWS granted Opus 4.5 (2M TPM) and Haiku 4.5 (5M) and denied the
5.5 models for «account history» (0 TPM; «subject to change automatically as time passes»). So the smoke runs on 4.5
and the stage's note on quotas says which 5.5 models are still at 0.
With the owner's Bedrock key in the environment: one Haiku 4.5 call (ten tokens), one Opus 4.5 DM turn on a throwaway
local campaign through the app's own loop with the roll check, one Fable 5.1 call **only if** the owner says the
retention mode is set. Record ids, costs and the quota headers; put them in the report. If the first call returns
`AccessDeniedException`, stop and tell the owner which model access is missing.
**OpenRouter** (when `APP_OPENROUTER_API_KEY` is set): one Haiku 5.5 call, one Opus 5.5 DM turn through the app's loop
with the roll check on Haiku 5.5, and one Fable 5.1 call of ten tokens; record `upstream`, `servedModel`, ids, cost. This
is the door the owner plays through tomorrow and the stalled runs resume through, so its smoke matters most.

## Done when
Helper in place, zero hard-coded endpoints, tests green, CLOUD.md and `.env.example` updated (names only), the smoke
report with the three (or two) calls, and a one-paragraph note in the report on quotas seen (tokens per minute on
Opus 5.5 in the owner's region) with the Service Quotas names to raise if they are below what four parallel tables need
(~100k output tokens/min). Then the owner decides the order: his own table first, or the stalled runs (GAME_PLAYER_1 Table B, GAME_PLAYER_2, the
re-judging) — each resumed with `ANTHROPIC_PROVIDER=openrouter` and the provider column in its ledger.
