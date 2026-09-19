# Smoke routing gate correction and recovery 2

Experiment only, based on frozen checkpoint `62772744d48a9c20611bd0c973dea9d0c7ba45cb`. Prior recovery commit `2bf147d7c03e0f0eea596674b0a38e5791f489bf` was pushed unchanged before this correction. No production, architecture, migration, dependency, benchmark dataset, threshold, split, resolver gold or frozen protocol changes.

## Routing evidence

[MODEL_RUNTIME_BRIEF](../../MODEL_RUNTIME_BRIEF.md) permits actual model naming to be explicitly unknown. The old gate incorrectly rejected a funded HTTP-200 request solely because this optional field was absent. Its original failed record is preserved, not reinterpreted as a passed observation.

The corrected gate uses [documented Gateway routing metadata](https://vercel.com/docs/ai-gateway/models-and-providers/provider-filtering-and-ordering): original/canonical slug and model-attempt canonical slug must match the frozen requested model when supplied. The documented model-attempt ID accepts the exact canonical slash form or provider-colon form for these two pinned profiles. Supplied contradictions fail; optional fields are never fabricated.

Exactly one model-attempt record and one successful provider-attempt record must agree with the reported counts and pinned final provider. Any extra/failed/alternate attempt rejects the request, including mismatched array lengths hidden behind a count of one. The frozen profile and actual outgoing request retain the hard gateway.only restriction, no alternate models and zero retries. All original schema parsers, warnings and billing gates remain enforced.

Actual provider API naming is independent provenance: allowlisted providerApiModelId/resolvedProviderApiModelId is retained, absence is null/UNKNOWN. SDK response.modelId is never used as execution proof. Contradictory supplied API names still fail closed. Safe records contain only allowlisted identifiers, counts, booleans and usage/cost; no raw response, error, secret or planning text.

## Append-only recovery

[Recovery 2 manifest](fixtures/smoke-recovery-2.json), approval hash `b2f728a0607debd9f97a84d2e272353896674b30bb740637c23503857c9f10b1`.

Five new IDs in order: smoke-plan-recovery-2, smoke-narration-recovery-2, smoke-feedback-recovery-2, smoke-summary-recovery-2, smoke-jev-recovery-2. Each request hash is identical to its original frozen smoke request; schemas, inputs, prompts, profiles and parsers are unchanged. These IDs do not reuse even the previously unattempted feedback/summary/Jev IDs.

All seven existing files are verified by exact byte hashes before/after execution. Original reservations.jsonl and recovery-1 ledger stay read-only. The prior two owner-reported pre-inference 403/$0 failures and the funded smoke-plan-recovery-1 rejection ($0.0283175 reported cost) remain historical failures. New manifest, ledger, observations and append-only results use recovery-2 names and exclusive creation; reruns cannot overwrite or retry them.

All three prior reservations remain counted: $1.03584 + at most $1.40112 = $2.43696. Three prior requests + five new requests = eight cumulative maximum. The existing $3/no-refresh key budget remains in force. Stop on the first failure (stricter than the permitted second unexpected transport failure), missing required routing/billing/usage, warning, schema error, provider/model discrepancy or reservation risk. No diagnostics, fallback, retries, full evaluation or implementation sprint. Five successful funded capabilities are required for transport smoke success.

## Actual deterministic verification

Experiment typecheck, lint, build and 111 tests passed (34 added), using mock HTTP only. Tests cover nullable provenance, canonical mismatches, provider pins/counts, hidden extra attempts, model echo, exact request parity, all history preservation, cumulative reservation/cost accounting, schema/billing failures, serialized execution and one-shot IDs. [Verification record](results/smoke-recovery-2-verification.json). Root application/database/browser suites were not rerun; their code is unchanged. No new live call has occurred at this pre-call commit.

Official catalogs rechecked September 19: Astra $10/M input and $50/M output. Jev now displays free promotional pricing through September 25, differing from earlier recorded paid pricing. The conservative frozen paid reservation is retained unchanged; zero cost must be explicitly reported, never assumed. [Astra](https://vercel.com/ai-gateway/models/gpt-6-astra), [Jev](https://vercel.com/ai-gateway/models/jev).

## Authorized execution after commit and push

From C:\Dev\personal-rpg-console-phase375-bakeoff\experiments\phase375-bakeoff, with the existing ignored secret file:

`node --env-file=.env.bakeoff.local src/run-smoke-recovery.mjs --recovery=2 --approved=b2f728a0607debd9f97a84d2e272353896674b30bb740637c23503857c9f10b1`

Run only once after the correction is committed and pushed. The CLI requires a clean bake-off branch descended from the frozen base. Results stay in ignored private-live-results. Report actual outcomes and stop for owner review; successful smoke does not authorize the full benchmark.
