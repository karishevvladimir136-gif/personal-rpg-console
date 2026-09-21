# D2A revised Stage 1.1 — awaiting explicit authorization

**NOT EXECUTED. Zero additional live provider requests are authorized by the budget-repair instruction.** This is a proposed replacement evaluation envelope, not a continuation of the stopped Stage 1.0 journal. GPT-6 Astra Stage 2 and D2B remain closed.

## Historical evidence remains unchanged

[Stage 1.0](D2A_LIVE_EVAL_STAGE1_REPORT.md) attempted one GPT-5.4/high composition against implementation `69abccfc1bc41d292466246e8f1d4ade69914b8f`. Actual model `gpt-5.4-2026-03-05` returned `incomplete/max_output_tokens`: 1,046 input and 4,096 output tokens, including 4,008 reasoning tokens. Only 88 non-reasoning tokens remained. No complete proposal was accepted, no simulation run was created and active state remained unchanged. Returned-usage cost was **$0.064055**, not an independently retrieved invoice.

That sample is **inconclusive because of production output headroom**, not a model-quality failure or a successful scenario. The original plan, report, response, usage and stopped journal are preserved. A revised trial must use a separate journal/directory and report that historical charge separately.

## Narrow production correction

The existing budget function now selects the output reserve by its existing task and, for resolution, detached simulation purpose:

| Path | Maximum output tokens, including reasoning |
| --- | ---: |
| `world.compose` | 16,384 |
| D2A `world.resolve` simulation | 8,192 |
| Ordinary DM, Memory, compiler, gameplay World Logic and other existing paths | 4,096 |

The same selected reserve reaches the existing Responses requester's `max_output_tokens` and input admission: `min(inputCap, contextLimit - outputReserve - safetyMargin)`. Production input capability remains **64,000** conservative accounting units. Model limits, reasoning, provider selection, schemas, Scenario/Divergence authority, settlement and retry behavior are unchanged. Safe server attempt diagnostics now include `maxOutputTokens`, including failed attempts. No database or durable/public schema change is needed; historical usage and committed operation receipts are not rewritten or re-executed.

Candidate for **both** tasks remains **GPT-5.4 / high**, direct OpenAI Responses, standard processing explicitly pinned with `service_tier:default`. Accept actual identity only `gpt-5.4` or documented `gpt-5.4-2026-03-05`, and require identity consistency during the trial. No reasoning downgrade, provider/model substitution, fallback, tools, browsing, background execution or automatic retry. Strict schema, `store:false`, truncation disabled and the existing 60-second timeout remain in place. More output headroom does not guarantee completion within the unchanged timeout; timeout/truncation remains inconclusive.

## Frozen fixtures and offline preflight

Committed fixture definitions: [d2a-evaluation-fixtures.mjs](tests/d2a-evaluation-fixtures.mjs). The matching [preflight regression](tests/d2a-evaluation-preflight.test.mjs) uses the actual authoring service, provider adapters, explicit scripted review/approval, D1 continuation and disposable PGlite state. Its transport is scripted, global network fetch is blocked, and no real key is read. Test-only approval of scripted responses does not authorize automatic approval of future live results.

The same eight semantic cases, languages, model and reasoning from Stage 1.0 remain:

| Call | Frozen case / task | Full wire input accounting in scripted preflight | Output cap |
| --- | --- | ---: | ---: |
| 1 | EN harbor: Mara keeps eastern gate open despite petition; `world.compose` | 8,518 | 16,384 |
| 2 | EN harbor patrol: reviewed call 1; `world.resolve` | 8,591 | 8,192 |
| 3 | RU polar station: send existing repair group toward eastern warehouse before noon; `world.compose` | 8,615 | 16,384 |
| 4 | RU polar repair/logistics first segment; `world.resolve` | 8,808 | 8,192 |
| 5 | RU polar continuation and local lost-response replay; `world.resolve` | 8,818 | 8,192 |
| 6 | EN synthetic Robb pre-feast temporal trap; `world.compose` | 8,671 | 16,384 |
| 7 | EN known-route courier continuation, future facts unavailable; `world.resolve` | 8,493 | 8,192 |
| 8 | RU «Что, если она передумает до встречи?» with two plausible people/meetings; `world.compose` only | 8,365 | 16,384 |

The originally executed harbor sample remains separate; these are frozen synthetic **preflight** sizes, not additional live results or a claim of byte-identical request bodies across randomly allocated campaign identities. Source-free cases preserve existing capabilities, stock, earlier history and player control. The polar fixture starts with ten supply units and six focus units; its scripted local preparation/recovery leaves seven supplies and does not invent travel authority. A live proposal that requires an unavailable effect must pause or receive explicit bounded owner correction, never acquire new capabilities to make evaluation pass. The temporal fixture pins a short invented future-source reference, excludes it from courier knowledge and resolver context, and imports no real campaign or book text. The ambiguous case must remain blocked for review.

**Evaluation-only ceiling: 20,000 conservative input-accounting units for every request.** Count the complete serialized wire body, including instructions, mandatory evidence, strict schema, reasoning configuration and standard tier, as UTF-8 bytes plus 2,048 framing units. All eight frozen fixtures pass without truncation; the largest measured size is 8,818. Production input capacity is not reduced.

Live proposals/manual review can alter later request sizes. Recheck the actual full request immediately before each dispatch. If it exceeds 20,000, stop and report; do not trim mandatory evidence, silently summarize, reduce output/reasoning or raise the ceiling. Passing these offline fixtures is not permission to bypass the live per-request preflight.

## Revised cost envelope

The [official GPT-5.4 page](https://developers.openai.com/api/docs/models/gpt-5.4), checked September 20, 2026 (local date), lists standard text pricing of **$2.50 per million input tokens** and **$15.00 per million output tokens**. No cached-input discount is assumed. The input ceiling is below long-context surcharge thresholds. Recheck these rates before any later authorized dispatch; changed rates/tier or an unbounded billing envelope must stop the trial.

| Requests | Input ceiling each | Output cap each | Maximum charge each | Group maximum |
| --- | ---: | ---: | ---: | ---: |
| 4 composition | 20,000 | 16,384 | $0.29576 | $1.18304 |
| 4 resolution | 20,000 | 8,192 | $0.17288 | $0.69152 |
| **8 total** | **160,000** | **98,304** | | **$1.87456** |

`4 × (20,000 × $2.50 + 16,384 × $15.00) / 1,000,000 + 4 × (20,000 × $2.50 + 8,192 × $15.00) / 1,000,000 = $1.87456`.

Proposed **new Stage 1.1 hard provider-charge cap: US $2.00**, excluding taxes/external account fees as before. Reserve **295,760 microdollars** per composition attempt and **172,880 microdollars** per resolver attempt before dispatch. Maximum new standard token charges leave **$0.12544** headroom. Separately adding Stage 1.0's reported-usage $0.064055 gives **$1.938615** across the historical request plus the maximum proposed new trial; historical cost is neither erased nor counted as a successful case.

## Execution and stop rules for later authorization

1. Fresh isolated synthetic fixture state only. No owner database, real import, hosted migration or deployment. Use the existing requester and services with an evaluation-only transport guard; no second application requester or registry.
2. A fresh append-only journal records at most **eight sequential network attempts**, exactly four composition slots and four resolver slots. Failures, cancellations and timeouts consume their slot/reservation even when usage is unavailable. No ninth attempt, duplicate dispatch, automatic retry or replacement slot. Never reopen or mutate the stopped Stage 1.0 journal.
3. Before each dispatch validate the exact URL, model, high reasoning, task-specific cap, complete 20k input ceiling, strict schema, no tools, standard tier and remaining attempt/charge envelope. Disable redirects and unguarded outbound calls. Keep the 60-second timeout. Do not make a live connection/token-count probe.
4. Between composition and its dependent resolver, a human reviewer examines the original result, records bounded manual corrections/answers and explicitly approves through the existing Scenario/Divergence path. Do not auto-approve to fill the eight slots. Skip dependent work when it cannot legitimately run, and disclose incomplete coverage.
5. After the polar second continuation durably commits, replay its recorded operation locally with outbound transport forbidden. There must be no second provider request, duplicate checkpoint, resource effect, Event or time advance. Active playable projection/head must remain unchanged throughout all cases.
6. Stop immediately on safety/authority/privacy leakage, invented Canon accepted as fact, forced PC action, uncommitted effects presented as success, live/cross-branch mutation, unexpected model/tier or fallback, unknown extra attempt, missing billing/identity/usage evidence or any inability to enforce the envelope. Preserve the last coherent state and report the defect.
7. For this revised trial explicitly halt on incomplete/truncated output, refusal/access failure, timeout, transport loss or malformed output as well. Preserve raw safe evidence, classify appropriately and make no automatic budget or reasoning adjustment. Safe rejection is not proof of model quality.
8. Report each planned slot separately, requested/actual model and tier, available usage, calculated cost versus any available billed evidence, original safe output, manual corrections, committed checkpoint/replay evidence and composition/simulation assessments. Never disclose keys, private prompts or reasoning text. Stage 1.0 remains a separate historical row/report.

The original [quality/safety criteria](D2A_LIVE_EVAL_PLAN.md) continue to apply. Passing deterministic tests does not establish live quality. Stage 2 may only be proposed after the full live safety/authority gates are established, and requires separate explicit authorization; this plan makes no Astra request.

## Deterministic verification

Focused repair regressions: **81 passed, zero failed**. All four disposable fixture flows passed and accounted for eight scripted provider requests. Coverage includes task caps, unchanged ordinary tasks, context reserve boundaries, strict malformed/incomplete rejection, pinned GPT-5.4/high, no fallback/retry, ambiguous approval blocking, future-source separation, unchanged active projection and durable continuation replay.

After the corrected code candidate was frozen, exactly one fresh complete repository run collected **1,096 tests: 1,095 passed, zero failed, one explicitly opt-in hosted test skipped**, in **393.960 seconds**. Route type generation, non-incremental typecheck, repository-wide zero-warning lint and the production webpack build all passed. Final source hashes remained unchanged during verification. [DEV_STATUS.md](DEV_STATUS.md) records the checks and limitations; the publication SHA accompanies the owner handoff. No additional live evaluation, Astra Stage 2 or D2B is authorized by this document.
