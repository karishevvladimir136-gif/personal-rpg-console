# Bedrock provider 1 — report

Stage: `docs/stages/BEDROCK_PROVIDER_1.md` (on `claude/handoff`). Branch from `origin/claude/s3-candidate` (`be4b315`).
Paid calls: Amazon Bedrock only. **Spent: $0.00** (both calls were refused before any inference). No call went to the
Console's API: this session had no `ANTHROPIC_API_KEY` in `.env.local`, and the smoke sent every request through a guard
that refused any host except the Bedrock door.

## What changed

- **One place knows the door.** `src/lib/server/anthropic-endpoint.ts` reads `ANTHROPIC_PROVIDER` (`anthropic`, the
  default, or `bedrock`) and returns the base URL, the key, the provider's model id and a label.
  - `anthropic`: `https://api.anthropic.com`, `ANTHROPIC_API_KEY`, ids unchanged.
  - `bedrock`: `https://bedrock-runtime.${AWS_REGION}.amazonaws.com/anthropic`, `BEDROCK_API_KEY` sent in `x-api-key`,
    ids mapped to `global.anthropic.claude-{opus-5-5,fable-5-1,sonnet-5-5,haiku-5-5}`.
  - A missing or invalid region, an unknown provider, or an unmapped id is `not_configured`. An unmapped id is named in
    the message; the provider value is never echoed.
  - The scripts' mirror, `scripts/eval/lib/anthropic-endpoint.mjs`, reads the door from `.env.local` or the cloud's
    `APP_` variables and passes keys explicitly. Only the door's name and region go into `process.env`, never a key.
- **No hard-coded endpoint is left.** I found 21 sites, not 19: 12 in `src` and 9 in `scripts/eval`. All of them now go
  through the helper, and every Anthropic key read in `src` and `scripts` uses the door's key. A test walks `src` and
  `scripts` and allows the hosts only in the helper.
- **The app's ids are unchanged.** The map applies at the transport. Thinking blocks stay bound to `claude-opus-5-5`. A
  Bedrock reply's profile id is turned back into the app's id before the SQL usage check sees it.
- **Errors.**
  - Bedrock `ThrottlingException` (429) → `rate_limited`, the existing bounded wait.
  - A refused model (403: `AccessDeniedException`, or the Anthropic-shaped `permission_error` actually seen today) →
    `not_configured`, never retried. The message names both ids: "Amazon Bedrock refused
    global.anthropic.claude-opus-5-5 (claude-opus-5-5): model access is not granted…, or for Fable 5.1 the
    data-retention mode is not aws_review".
  - A 403 about the key itself keeps the provider's (redacted) text.
  - Anthropic's own codes are not read on the Bedrock door. The `enforced_spend_limit_reached` pattern is not on this
    candidate.
- **Provenance.** Each harness call line (the loop bench, the DM-arch bench, the replay tool) gains `provider`,
  `endpointHost` and `requestId`, read from `request-id` or Bedrock's `x-amzn-requestid`. So do each run record's
  `calls[]` and each ledger entry, and the ledger tables now print "Spend per door". There is no `money.calls[]`, and
  there are no self-talk or game-player harnesses on this candidate, so their comparability notes are not part of this
  branch.
- **Docs.** `docs/CLOUD.md` step 3 now writes `ANTHROPIC_PROVIDER`, `BEDROCK_API_KEY` and `AWS_REGION`, and the
  allowlist gains `bedrock-runtime.us-west-1.amazonaws.com`. `.env.example` is new, holds names only, and has an
  exception in `.gitignore`. `docs/MODELS.md` has a row for the second door.
- **Smoke tool.** `scripts/eval/bedrock-smoke.mjs` runs on its own ledger, `bedrock1`, capped at $3.

## Which endpoint

Anthropic's current docs give a different URL for this service: `https://bedrock-mantle.{region}.api.aws/anthropic`
with `anthropic.`-prefixed ids. That host is blocked by this environment's network proxy (HTTP 502). The stage's host
answered the Messages API with Anthropic-shaped errors and an `x-amzn-requestid`. I checked this with three free
probes: one with no key and two with a fake key. It took the key in `x-api-key` and in `Authorization: Bearer`. I kept
the stage's host and the `global.` ids. The refusal below named `anthropic.claude-haiku-5-5`, so Bedrock understood
the profile id.

## Smoke (the only paid part)

| # | Call | Result | Request id | Cost |
| --- | --- | --- | --- | --- |
| 1 | Haiku 5.5, 10 tokens | HTTP 403 `permission_error`: "anthropic.claude-haiku-5-5 is not available for this account… contact AWS Sales" | `a9b91947-4e9a-4bb6-8c46-54d96dc213e1` | $0 |
| 1b | the same, after 60 s (the one retry) | HTTP 403, the same message | `dc706f1b-011a-423f-b0a0-46ac9d2ac366` | $0 |
| 2 | Opus 5.5 DM turn | **not run**: the smoke stops after a refusal (the stage's rule) | — | — |
| 3 | Fable 5.1 | not run (as the task said) | — | — |

The key works: authentication passed, and the refusal is about model access. The 403 responses carried no quota or
rate-limit headers, only `x-amzn-requestid`. Records: `docs/runs/bedrock-provider-1-smoke.json` and the ledger
`docs/runs/bedrock-provider-1-ledger.md`.

**What the owner needs to do:**
1. Open the AWS console, Amazon Bedrock, Model access. Ask for access to **Claude Haiku 5.5** and **Claude Opus 5.5**,
   plus Sonnet 5.5 for the combat draft and the picture brief. AWS sets the criteria for each of these models, and the
   message points to AWS Sales.
2. For Fable 5.1, set the account's retention mode to `aws_review`.

Haiku 5.5 runs the app's small checks: the roll check, the ledger check, the quotable lines, the fight-note fold, the
shot and the frame check. On the Bedrock door without Haiku, each of these reports an error and the turn goes on
without it.

## Quotas (tokens per minute, Opus 5.5, us-west-1)

**I could not observe the Opus 5.5 quota.** Opus was never called because of the stop rule. The Haiku refusals carried
no quota headers. A Bedrock API key cannot read Service Quotas, which needs an AWS IAM credential.

Anthropic's Bedrock page (read 2026-10-25) gives these figures:
- the default is 2 million input tokens per minute;
- up to 5 million input and 500,000 output tokens per minute can be requested without Anthropic's approval;
- AWS sets the requests-per-minute limits.

Four parallel tables need about 100k output tokens per minute, which is inside that requestable range. To check:
Service Quotas → Amazon Bedrock → search "Claude Opus 5.5". Read the global cross-region **tokens per minute** quota
and the **requests per minute** quota for Opus 5.5. If the output-tokens figure is below about 100k/min, request an
increase there; AWS shows the exact names. The first successful Opus call will also show whether Bedrock returns
rate-limit headers, and the harness records them.

## Checks

The final checks ran on a clean worktree (no `.env.local`) at the committed candidate; the numbers are in
`DEV_STATUS.md` and the commit message. The new tests (`tests/bedrock-provider-1.test.mjs`) cover:
- each door's URL, headers (key presence only) and mapped id;
- the not-configured cases;
- the throttling, model-refusal (recorded body), Fable-retention and bad-key mappings;
- a check and the opening's structured call on Bedrock;
- the call line's provider, host and request id;
- spend per door;
- the no-hard-coded-endpoint walk.

These tests changed by one line each without changing what they check: three now compare the URL with the helper's
`anthropic` URL; one checks that the harness reads `anthropicKey()` instead of `providerKey("ANTHROPIC_API_KEY")`; and
the startup-gate test's module map gained the helper.

## Next

Once access is granted for Haiku 5.5 and Opus 5.5:
1. Re-run `node scripts/eval/bedrock-smoke.mjs` (≤ $3).
2. Read the Opus quota in Service Quotas.
3. The owner decides the order: his own table first, or the stalled runs.
