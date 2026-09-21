# D2A Stage 1 live evaluation — stopped, inconclusive

The owner explicitly authorized the eight-call GPT-5.4/high plan with its US $2 provider-charge cap and all stop conditions. Evaluation used implementation `69abccfc1bc41d292466246e8f1d4ade69914b8f` on `codex/world-lab-d2a-single-model`. **Only call 1 was attempted.** It exhausted the approved output allowance and returned an incomplete response. No retry, fallback, budget increase or further model request followed.

The approved plan classifies output truncation as **inconclusive** and forbids automatic budget increases or retry requests. The evaluation guard conservatively stopped the trial on this incomplete response, before any owner review/approval or detached simulation.

## Per-call results

| Planned call | Task / language | Result | Actual model / usage |
| --- | --- | --- | --- |
| 1 | Harbor political premise · `world.compose` · EN | HTTP 200, response `incomplete`, reason `max_output_tokens`; no accepted proposal | `gpt-5.4-2026-03-05`, standard `default` tier; 1,046 input / 4,096 output tokens |
| 2 | Harbor continuation · `world.resolve` · EN | Not attempted — call 1 incomplete; trial halted | None |
| 3 | Polar-station premise · `world.compose` · RU | Not attempted — evaluation stopped | None |
| 4 | Polar-station first segment · `world.resolve` · RU | Not attempted — evaluation stopped | None |
| 5 | Polar-station continuation/recovery · `world.resolve` · RU | Not attempted — evaluation stopped | None |
| 6 | Famous-world temporal trap · `world.compose` · EN | Not attempted — evaluation stopped | None |
| 7 | Famous-world continuation · `world.resolve` · EN | Not attempted — evaluation stopped | None |
| 8 | Ambiguous premise · `world.compose` · RU | Not attempted — evaluation stopped | None |

Call 1 began at **2026-09-21 02:24:12 UTC**. Requested model was exactly `gpt-5.4`, reasoning `high`, with `service_tier:default`, strict structured output, `max_output_tokens:4096`, `store:false` and truncation disabled. The actual model and tier matched the approved identities. The provider returned the beginning of a JSON proposal, but no complete object. It was rejected and did not reach the review phase.

## Usage and charge

| Returned usage | Tokens |
| --- | ---: |
| Input | 1,046 |
| Cached input | 0 |
| Output, including reasoning | 4,096 |
| Reasoning subset of output | 4,008 |
| Non-reasoning remainder | 88 |
| Total input plus output | 5,142 |

The [official GPT-5.4 pricing page](https://developers.openai.com/api/docs/models/gpt-5.4), rechecked before dispatch, listed standard input at $2.50/million and output at $15.00/million. The calculated token charge from returned usage is:

`(1,046 × $2.50 + 4,096 × $15.00) / 1,000,000 = US $0.064055`.

Thus the reported-usage charge is approximately **6.41 US cents**. No cached-input discount applies. This is a calculation from provider-returned usage, not an independently fetched billing invoice; no billing API request was made. No other live attempt occurred. The pre-dispatch reservation was $0.22144, comfortably within the hard $2 ceiling; the unused allowance was not treated as permission to retry.

## Authority, privacy and state evidence

- The actual production composer adapter and authoring service ran over the existing disposable PGlite fixture/migrations. Only synthetic campaign/source state was used. No hosted or owner database connection was opened.
- An evaluation-only transport guard explicitly pinned standard processing, allowed only the documented Responses URL and `gpt-5.4/high`, disabled redirects and any unguarded fetch, enforced 64,000 input-accounting units / 4,096 output tokens / 60 seconds, and reserved the maximum charge in an append-only audit journal before dispatch.
- Offline guard tests passed: a ninth attempt, duplicate attempt, wrong model and retry after a failed transport were all blocked. These tests used scripted responses and made zero live requests.
- The outbound input's conservative UTF-8/framing accounting was **8,559**, below 64,000. Private/future canaries were checked before dispatch and against returned final text; none crossed those boundaries. Only final response text/usage was retained, not model reasoning output or authorization headers.
- The real service accepted no composition result. The literal premise/request may remain in the synthetic immutable Scenario history, but there is no approved Scenario/Divergence and no prepared run.
- Active campaign/projection digest before and after was identical: `341fbeec49517abf57f978c9c830e55fa792ad0551b479d0b88171b09dd1765e`. **World Lab run count: zero.** No simulation checkpoint, fictional time, World Event, inventory/resource, reward or progression effect was committed.
- No key was printed or retained in reports, request artifacts or browser data. Only the API key was read from existing local configuration; owner database credentials were not loaded. The original dirty checkout's two file hashes remained unchanged.

Local ignored evidence is in `test-results/d2a-stage1/`: `attempts.journal.ndjson`, `call-1-provider.json`, `call-1-result.json`, the synthetic database export and the evaluation guard/preflight scripts. The journal is stopped and prevents reuse as an automatic retry. The production implementation is unchanged.

## Assessment and defects

**Composition quality: inconclusive.** The response is truncated, so its full structure, consequential ambiguities, source distinctions and manual-review usability cannot be graded. The partial text is not evidence of a successful proposal.

**Simulation quality and continuation/recovery: not evaluated.** Calls 2–8 were not dispatched. Stage 1 has not passed the complete safety/authority evaluation: the exercised first-call boundary held, but live resolver, continuation, Russian and temporal-trap coverage is absent.

**Manual corrections required: not assessable.** No complete reviewable proposal existed. No manual edits or approval were made, and another model request was not used to hide the failed sample.

**Observed limitation:** in this sample, the approved 4,096-token total output cap with `high` reasoning left only 88 non-reasoning tokens and could not finish the composition schema. This exposes insufficient output headroom for this particular model/profile/case; it does not prove all high-reasoning requests fail. The application safely rejected the incomplete response. No safety, authority, privacy, fallback, unexpected-model or live-state mutation failure was observed in the one attempted call. No production repair was made during evaluation.

## Stop point

Stage 1 is **stopped and inconclusive** at one of at most eight authorized attempts. There is no automatic retry or continuation under the original plan. A revised output/reasoning budget and a separately reviewed evaluation envelope would be needed before another attempt; none has been applied or authorized here.

Because the full Stage 1 safety/authority gates were not established, no Stage 2 proposal is presented as qualified and no GPT-6 Astra request was made. D2B, deployment, main changes, real-data imports and production migration execution remain closed. Owner acceptance of D2A is still separate and pending.
