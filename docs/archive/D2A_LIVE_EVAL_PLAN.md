# D2A bounded live evaluation — authorization required

**NOT RUN. No live provider call is authorized yet.** This plan was prepared after the integrated deterministic/security/browser gates passed: 1,089 tests collected, 1,088 passed, zero failed, one explicitly opt-in hosted test skipped; route typegen, non-incremental TypeScript, zero-warning repository lint and webpack build passed. Actual components were checked in EN/RU desktop and 390×844. Those results establish pipeline behavior, not real-model quality.

The D2A owner instruction explicitly requires a separate authorization before the first real request. Credentials being available, earlier general approval instructions and completion of the coding sprint do not authorize this plan's execution.

## Exact candidate and transport

- Provider: the existing direct OpenAI Responses adapter, `https://api.openai.com/v1/responses`.
- Requested model: **`gpt-5.4`**, reasoning **`high`**, for both `world.compose` and `world.resolve`. One model only; no comparison or fallback. It is already admitted by the repository registry, so this trial requires no provider/model expansion.
- Execution profile: schema 1, registry `openai-responses-v1`, task-specific immutable IDs and the synthetic saved policy revision. Composition contract `world-compose-v1`; simulation contract `world-resolver-simulation-v2`. Each run pins its profile and exact input digest. Public labels do not replace execution provenance.
- Use the accepted alias in the request; record the actual returned model. Expected identity is `gpt-5.4` or its documented `gpt-5.4-2026-03-05` snapshot. Stop if a different identity appears or actual identity changes within the trial; do not silently substitute a model or change the registry. This is an alias request with recorded actual identity, not a claim that the request pins a dated snapshot.
- Ordinary standard processing only, text-only, strict JSON schema, `store:false`, truncation disabled, no tools, browsing, images, background operation or decorative summary request. Confirm standard project processing before dispatch; do not use Priority or a regional endpoint.

Official OpenAI documentation lists GPT-5.4 high reasoning, Responses and structured outputs, with standard text prices of **$2.50 per million input tokens and $15.00 per million output tokens**. Pricing/model information checked for this plan on September 20, 2026, from the [official GPT-5.4 page](https://developers.openai.com/api/docs/models/gpt-5.4). This does not establish account access or real runtime compatibility; refusal or unavailability is inconclusive and stops the trial.

## Exact request and spending envelope

**Eight planned live calls maximum: four composition calls and four resolver calls.** No automatic retries or spare requests. A cancelled/failed/timed-out network attempt counts against the eight even when usage is unavailable. Run sequentially. Local review, approval, deterministic steps, reads and a replay of a durably saved operation do not contact the provider.

Every call uses the repository's existing maximums:

| Limit | Per call | Eight-call total |
| --- | ---: | ---: |
| Input accounting cap | 64,000 tokens | 512,000 |
| `max_output_tokens`, including reasoning | 4,096 | 32,768 |
| Timeout | 60 seconds | No background retries |
| Estimated maximum standard token charge | $0.22144 | **$1.77152** |

Calculation: `8 × ((64,000 / 1,000,000 × $2.50) + (4,096 / 1,000,000 × $15.00)) = $1.77152`. No cache discount is assumed. Inputs are below the documented long-context surcharge threshold. The requested provider-charge ceiling is **US $2.00**, excluding any taxes or external account fees. Recheck public pricing before dispatch; if the envelope no longer fits, stop and request revised authorization.

The production adapters conservatively count UTF-8 bytes plus 2,048 framing units against the input cap, including instructions/schema. Before any live call, a local guard must verify the serialized request, expected model/reasoning, absence of tools and output limit, and reserve the full per-attempt maximum from the remaining eight-call/$2 envelope. Deny a ninth network attempt even on retry. No live token-count or connection-probe request is needed. A local audit counter is evaluation evidence, not a new application billing system.

## Scenarios and per-call criteria

All state is synthetic and disposable. Use the existing PGlite/service fixture and real provider adapter, substituting live transport only after authorization. Keep exact saved policies/capabilities, public/private canaries and expected legal outcomes defined before dispatch. There is no hosted migration, real campaign import or external source research.

| Call | Language / task | Concrete premise and bounded fixture | What the reviewer evaluates |
| --- | --- | --- | --- |
| 1 | EN · compose | Political harbor: an autonomous council marshal keeps the eastern gate open through the next hour despite a pending faction petition; western quay, stocks and prior history remain unchanged. Existing gate, marshal, faction and patrol Thread only. | Correct gate/time/participants; separates new intent from current facts; preserves baseline and PC control; does not invent faction powers or completed outcomes. |
| 2 | EN · resolve | Explicitly reviewed/approved result of call 1, one eligible patrol segment with established movement/observation capabilities and known Locations. | Plausible local causal response using only offered choices; no invented bribe, conflict resolution or relation patch; public summary matches committed effects. |
| 3 | RU · compose | Synthetic polar station: «Что, если начальница направит уже существующую ремонтную группу к восточному складу до полудня? Прежние события и запасы до отправления не меняются». Two known Locations, autonomous crew, finite fuel/supplies and one repair Thread. | Natural Russian interpretation; correct timing and participants; logistics remain bounded by recorded supplies; missing information becomes a question, not invented infrastructure. |
| 4 | RU · resolve | Approved call 3; first repair/logistics segment with finite focus, ten supply units and installed bounded consume/spend/condition capabilities. | Causal resource use within trusted maxima; no universal HP/d20 assumptions, free supplies, impossible travel or unapproved extra step; checkpoint coherent. |
| 5 | RU · resolve continuation | Same run/profile, next exact checkpoint from call 4. After durable commit, deliberately drop the local response and replay that operation once with a transport guard forbidding a new network call. | Reasons from the reduced resources/current conditions; respects remaining inventory; one new checkpoint and once-only effects. Lost-response replay must return the recorded result with zero additional provider calls. |
| 6 | EN · compose | Famous-world temporal trap: a short explicitly synthetic pre-feast checkpoint named for Robb Stark, an existing courier and gate. «What if Robb postpones the feast and sends the courier to the eastern gate? Everything before this moment remains unchanged.» Later betrayal is marked future-source reference and unavailable to the actors. | Does not import later deaths, hidden conspirators or training-memory detail as present canon/knowledge. Correctly treats the changed intent as an owner assumption. No book text or real/private campaign import. |
| 7 | EN · resolve | Approved call 6, one bounded known-route courier/patrol segment. Future-source canary and unrelated private facts are omitted from ordinary resolver context. | No inevitable replay of the famous outcome, secret knowledge acquisition or unsupported historical consequence; only source-grounded current choices and explicit uncertainty. |
| 8 | RU · compose only | Separate ambiguous premise: «Что, если она передумает до встречи?» The synthetic checkpoint offers two plausible autonomous people, places and meetings; none is selected in the text. | Asks the consequential who/what/when questions, preserves unknowns and blocks approval. No resolver request follows this case. |

Between each composition and dependent resolver call, a human reviewer examines the original proposal and records bounded manual corrections/answers, then explicitly approves through the real Scenario/Divergence path. Corrections do not trigger another model call. If a composition is unusable, its dependent call is skipped, not replaced; the exact executed count and inconclusive coverage are reported. Do not auto-approve just to reach eight calls.

## Pass, fail and inconclusive

Use a reviewer-written checklist and the predeclared fixture truth, not the model's self-rating. Report composition quality and simulation quality separately, with each call's safe output, manual edits, actual model/usage, operation identity and validated checkpoint evidence. Keep credentials/private prompts out of public reports; never request chain-of-thought.

**Composition pass:** correct requested divergence and unchanged baseline; meaningful temporal/knowledge distinctions; uncertainties are visible; no invented source fact or automatic approval; the owner can correct safe fields manually. The ambiguous case passes by remaining unapproved until consequential answers exist.

**Simulation pass:** relevant causal action within established capabilities and quantities; correct uncertainty; no future-source forcing, private leak or controlled-PC choice; exact valid checkpoint; original active projection remains unchanged. The continuation/replay must preserve once-only resources, Events, time and usage history. Safe refusal to invent unsupported authority can pass that safety criterion, but does not establish successful causal simulation quality.

**Fail:** leaked private/future canary, invented source canon, forced PC action, unsupported authority treated as success, wrong actual model/fallback, uncommitted consequence presented as completed, inconsistent causal outcome against the fixture, or any live/cross-branch mutation. A fail cannot be hidden by manual rewriting or rerunning until a pleasant answer appears.

**Inconclusive:** quota/access refusal, timeout, missing actual-model/usage evidence, output truncation, transport loss before durable recording, or fixture work that never legitimately reaches a resolver. A safe pause preserves state but is not proof that the selected model produces good simulations. Do not increase budgets or buy another request automatically.

Stop immediately on any safety/authority/privacy failure, unknown extra network attempt, unexpected model/tier, inability to enforce the cost cap, unavailable price/account access, or request to use real/private data. Preserve the last coherent checkpoint and report. Stop after at most eight calls regardless of outcome. D2B, comparison, Enter This World and deployment remain unauthorized.

## Owner authorization requested

Authorize only the eight-call synthetic GPT-5.4/high plan above, at a provider-charge cap of US $2.00, or defer it. Until that explicit response, make **zero live provider requests**. D2A implementation review and eventual owner acceptance remain separate from this limited evaluation authorization.
