# Phase 3.75 technical bake-off — stopped partial live evaluation

September 19, 2026. Branch: **codex/phase375-technical-bakeoff**. **STOPPED / INCOMPLETE — no implementation or production adoption.**

The owner authorized the frozen 120-request benchmark at **b3e0d5e65fedf1b85c6f526bee563c25cb24b34e**. Offline preflight reproduced that the original runner could continue after invalid structured output. The owner explicitly approved “Approve the stop-guard correction, then run.” The minimal first-failure guard was tested, committed and pushed at **8c5a9f7e731a9ab2ce24b17a61423fe7b46e1e23** before execution. That is the execution checkpoint. Dataset, split, prompts, profiles, thresholds, schemas, calibration method and resolver gold remained frozen.

**13 new attempts: 12 successful Jev development requests and 1 failed request.** The guard stopped immediately after recording the failure. **107 authorized requests were not attempted.** No retry, fallback, diagnostic, smoke rerun, model judge, implementation or Spatial work followed.

## Request results and transport evidence

All successful rows below requested **typesafe-ai/jev**; Gateway original/canonical/model-attempt slugs all report **typesafe-ai/jev**. Final and successful provider: **typesafe-ai**. Each has **1 model attempt, 1 provider attempt and 1 successful provider attempt**. Actual provider-internal API model is **UNKNOWN/null**, as permitted; SDK model echo is not used as evidence. The frozen profile retains the hard provider-only pin, no alternate model/provider and maxRetries 0. The strict warning gate passed for every success.

| Attempt ID | Result | Input tokens | Output tokens | Gateway USD | Wall ms |
| --- | --- | ---: | ---: | ---: | ---: |
| tidal-bell-jev | success | 3,134 | 1,000 | 0 | 840.8914 |
| guild-ballot-jev | success | 3,130 | 1,000 | 0 | 268.3931 |
| salt-road-jev | success | 3,551 | 998 | 0 | 354.1787 |
| silent-rehearsal-jev | success | 3,602 | 1,000 | 0 | 281.1466 |
| canal-audit-jev | success | 3,115 | 993 | 0 | 308.6468 |
| wedding-letter-jev | success | 3,159 | 1,002 | 0 | 278.2677 |
| clinic-interpreter-jev | success | 3,623 | 999 | 0 | 405.8998 |
| workshop-custody-jev | success | 3,611 | 999 | 0 | 316.0841 |
| railway-manual-jev | success | 3,186 | 1,002 | 0 | 342.8338 |
| seed-license-jev | success | 3,126 | 994 | 0 | 233.7618 |
| water-charter-jev | success | 3,712 | 996 | 0 | 290.1482 |
| museum-loan-jev | success | 3,711 | 1,002 | 0 | 266.3892 |
| beacon-batteries-jev | failed; stopped | UNKNOWN | UNKNOWN | UNKNOWN | 353.1238 |

The last row was the first comparison-family development attempt. Its preserved safe error is **provider / request_failed / retryable: true**. The descriptive retryable flag did not cause a retry. There is no retained HTTP status, usage, routing, warning count or cost for this failure. Its requested model/pin are known from the frozen profile, but its final provider, actual model and internal attempt counts are unknown. The safe category cannot distinguish a provider/transport failure from a local post-response validation exception: the runner applies fromJev after transport metadata extraction and a generic exception loses that metadata. No raw response was retained. **Root cause is unresolved; this report does not claim a 403, outage or malformed provider response.** No new diagnostic request was made.

13 is the exact harness invocation/reservation count. Twelve have verified single-provider execution; the failed invocation has no wire-attempt telemetry. No retry or fallback was configured or made by the runner; no fallback was observed in the twelve verified results, while failed-request provider routing cannot be verified.

[Sanitized observations, reservation entries and immutable file fingerprints](experiments/phase375-bakeoff/results/full-run-observations.json) contain synthetic IDs, normalized labels/scores and allow-listed metadata only. They contain no key, raw provider payload, header, reasoning text, real campaign data or source-library data.

## Accounting — reservations are not charges

| Stage | Attempts | Reserved USD | Known reported Gateway USD |
| --- | ---: | ---: | ---: |
| Original smoke | 2 | 0.69056 | unknown machine billing |
| Recovery 1 | 1 | 0.34528 | 0.0283175 |
| Recovery 2 | 5 | 1.40112 | 0.068655 |
| Stopped full run | 13 | 0.26 | 0 on 12 successes; failed charge unknown |
| Cumulative | **21** | **2.69696** | **0.0969725 known; total unknown** |

Successful new usage totals **40,660 input / 11,985 output tokens**. The failed attempt's usage and charge are not included as zero. The original smoke-plan and smoke-narration machine charges also remain unknown; the owner's earlier dashboard observation of $0 for those two 403s is separately attributed and does not replace missing API metadata. No current dashboard spend was inspected.

All three historical ledgers and their 15 original artifacts passed accepted-recovery verification byte-for-byte. The new ledger and 13 observations remain unchanged, with hashes covering all 29 original files. The cumulative reservation allowance is $30; $27.30304 remains arithmetically below that ceiling, **not permission for further calls**. No key, environment, budget, top-up or billing setting was changed.

## Development diagnostics — incomplete, not a calibration qualification

Only 12 of 16 Jev development snapshots completed: four Threads, four Actors and four Sources, with six English and six Russian scenarios. There are **216 scored binary relevance outcomes of the 288 required**, excluding 24 gold-uncertain candidates. No comparison-family result completed. **Astra classification: 0/16 development snapshots, ECE/Brier unknown.** No calibration-frozen artifact was written and neither classifier qualifies for pruning.

For the completed Jev subset, identity-score **ECE = 0.145741**, **Brier = 0.119811**. These partial diagnostics exceed the frozen ECE <= 0.05 / Brier <= 0.1 bounds, but they are not presented as a completed calibration result. No fitted transform, threshold search, prompt adjustment or held-out tuning was performed.

Raw label accuracy is **177/240 = 73.75%**. Of 144 relevant candidates, 100 were labelled relevant, 2 uncertain and 42 irrelevant. The label confusion matrix is distinct from threshold-based admission: most incorrect irrelevant labels do not reach the 0.99 pruning threshold. Nine candidates were labelled uncertain; zero choices were omitted or missing probabilities among the successful responses. Of 24 gold-uncertain candidates, 7 were labelled uncertain, 7 relevant and 10 irrelevant; all 24 survive the frozen threshold diagnostic and protected replay.

| Completed subset | Scenarios | Label accuracy | ECE | Brier | Raw threshold recall | Raw FN / critical misses | Protected replay FN |
| --- | ---: | ---: | ---: | ---: | --- | --- | ---: |
| Threads | 4 | 61/80 (76.25%) | 0.152222 | 0.105675 | 48/48 | 0 / 0 | 0 |
| Actors | 4 | 65/80 (81.25%) | 0.070139 | 0.062288 | 48/48 | 0 / 0 | 0 |
| Sources | 4 | 51/80 (63.75%) | 0.223750 | 0.191471 | 45/48 | 3 / 0 | 0 |
| Comparisons | 0 | not measured | unknown | unknown | not measured | unknown | unknown |
| English | 6 | 97/120 (80.83%) | 0.120926 | 0.095287 | 72/72 | 0 / 0 | 0 |
| Russian | 6 | 80/120 (66.67%) | 0.170556 | 0.144335 | 69/72 | 3 / 0 | 0 |

The offline replay of the frozen raw threshold, without mandatory protection and assuming calibration solely for this diagnostic, retains **141/144 relevant items (97.9167%; Wilson 95% interval 94.0542–99.2890%)**. It misses three nonmandatory Russian source passages in water-charter: c9e35ced5, ca59935d5 and c7034ee35. No raw critical miss occurs among the 24 completed-subset critical items. That small zero-miss sample is not evidence of universal safety.

The protected replay correctly uses **calibrated: false**, retains all 240 authorized candidates, and therefore retains 144/144 relevant, 24/24 critical and 24/24 uncertain items with zero scope leaks. This is a deterministic offline replay on observed development outputs, **not a live held-out or end-to-end resolver result**. Its perfect retention comes from bypassing pruning; it does not rescue classifier quality. Omitted/malformed responses were not experimentally substituted into live results; their retention behavior remains covered by offline policy tests.

## Reduction, overhead and missing downstream evaluation

On the completed development subset, the raw threshold diagnostic would remove **36/240 candidates (15%)** and **3,289/23,963 serialized candidate bytes (13.73%)**, including the three relevant misses. The protected uncalibrated replay removes **0 candidates and 0 bytes**.

The classifier adds **104,036 serialized input bytes +26,799 normalized-output bytes =130,835 bytes** across these twelve requests. These are local UTF-8 serialization measurements using the frozen measurement convention, not actual HTTP wire sizes or interchangeable model tokens. With no protected reduction, the corresponding net serialized byte saving is **negative 130,835**. There is no measured reduction in strong-model tokens, money or end-to-end latency because no resolver was called.

Successful classifier wall-time **p50 =290.1482 ms; p95 =840.8914 ms (n=12)** using the frozen nearest-rank quantile convention. Failed wall time is 353.1238 ms. These are observed sequential call durations, not a concurrency/load benchmark. Paired A/B/C latency and cost remain unknown.

**Held out: 0/64 classifier calls.** Relevant recall, false negatives, critical misses, uncertainty losses and scope/timeline failures are **not measured**, not zero. No protected held-out performance or frontier classifier comparison is available.

| Sentinel | A | B | C | Lost findings vs A / unsupported claims / scope-timeline failures |
| --- | --- | --- | --- | --- |
| orchard-smoke | not run | not run | not run | unknown |
| ferry-debt | not run | not run | not run | unknown |
| treaty-release | not run | not run | not run | unknown |
| archive-witness | not run | not run | not run | unknown |
| island-veto | not run | not run | not run | unknown |
| hospital-generator | not run | not run | not run | unknown |
| flood-branches | not run | not run | not run | unknown |
| embassy-delay | not run | not run | not run | unknown |

No baseline A result exists; B/C cannot claim parity, improvement or a downstream failure rate. [Recomputed metrics, confusion matrices, Wilson/cluster intervals and explicit nulls](experiments/phase375-bakeoff/results/full-run-analysis.json).

## Recommendations for owner review

| Task family | Recommendation | Evidence |
| --- | --- | --- |
| World Thread relevance | **DO NOT ADOPT** | Incomplete calibration and no held-out or downstream benefit evidence; subset ECE exceeds bound |
| World Actor relevance | **DO NOT ADOPT** | Best observed subset accuracy does not establish calibrated pruning or ranking benefit; no held-out evaluation |
| Canon/source classification | **DO NOT ADOPT** | Three relevant raw-threshold misses, poor partial calibration and no validated protected savings |
| Parallel outcome comparisons | **DO NOT ADOPT** | First attempt failed; no successful quality measurement |

These are current adoption decisions for the tested Jev configuration, not universal claims about the vendor or proof that an untested reranking workflow would fail. **Reranking/prioritization is not approved by this incomplete run either.** Keep deterministic eligibility and the owner's strong reasoning model as the unaltered baseline.

| Architecture item | Recommendation from this evidence |
| --- | --- |
| Vercel AI Gateway | Retain as a candidate transport for a separately authorized Model Runtime sprint. Accepted recovery-2 proves the four unchanged schema capabilities plus Jev evaluation transport; twelve further Jev calls verify pinned routing/billing. The incomplete benchmark does not establish all-provider reliability, model replaceability or real-data privacy. Do not adopt into production in this task. |
| AI SDK | Keep it behind the small server-only transport adapter. Domain schemas/parsers, authoritative state, provenance, provider pins, budgets and no-fallback policy remain application responsibilities. No SDK types or routing authority in durable world ontology. |
| Jev | Disabled for production and live pruning. Synthetic quality gate incomplete/unmet; the optional layer is unnecessary for continuing the architecture. |
| classifier.dev | Not required or contacted; no demonstrated need for another proxy. Any comparator needs separate authorization and privacy review. |
| OpenRouter | Defer; this run demonstrates no Gateway capability gap requiring a second transport. It was not evaluated. |
| GLiNER | Defer to a separately scoped source-extraction evaluation if needed; this relevance benchmark supplies no extraction-quality evidence. |
| Vercel Workflows | Defer; no evidence here that existing Postgres operation/job patterns are insufficient. No hosted orchestration or second backend added. |

**Privacy is a separate gate.** Jev remains NOT_ELIGIBLE for real campaign, private or uploaded-source inputs under the unresolved exact-route privacy policy recorded in the frozen documentation. Synthetic accuracy or transport success cannot resolve conflicting retention/training evidence. No real material was used or authorized.

## Verification, reporting correction and stop boundary

The stop-guard checkpoint passed **155 deterministic tests, typecheck, lint and experiment build before the run**. After the stopped run, **167 deterministic tests, experiment typecheck, lint and build passed** (12 added report tests; zero skipped/failed in the final run). Report generation and validation made zero live calls; the final verification artifact records the exact rerun results. [Final verification and changed-file scope](experiments/phase375-bakeoff/results/full-run-verification.json). The report tests recompute metrics, enforce missing-data semantics, verify artifact anchors, preserve the frozen protocol and reject altered observations. Application/browser/database suites are not rerun or relabelled as passed by this isolated experiment.

**GitHub main was verified as cb7f6be2fb513de13604d381046a3240f3261383.** The stale prior mainUnchanged field had reported the distinct local main ref 96964964a7d5046ff34b6b6ae695ecf494885cc4; the historical verification record now labels both accurately. Neither main ref was moved. The original checkout's pre-existing documentation edits remain untouched and unattributed.

Limitations: stopping before the comparison family creates selection/coverage bias. Authored scenarios and within-scenario candidates are correlated; descriptive Wilson and cluster intervals are not natural-campaign guarantees. Partial development accuracy cannot stand in for held-out performance. Strict synthetic gold is finite; no paired resolver benefit, universal privacy, perfect memory, branching or recovery claim follows. Physical iPhone/Safari and the optional historical Phase 1 conflict-rebase confirmation remain unverified. No hosted deployment or real campaign/private-data acceptance occurred.

**Stop for owner review.** The unresolved failure and incomplete calibration/held-out/sentinel coverage block benchmark qualification. Any future diagnosis or additional execution requires a new explicit scoped authorization; existing reservations/results must not be repeated, erased or reinterpreted as successes. Do not start implementation, Spatial/EXPLORE, later milestones, deployment or import.

---

# Historical offline checkpoint — preserved record

The following was written before any live smoke or full-run attempt. Its zero-call figures, test counts, “awaiting approval” language and catalog observations describe that earlier checkpoint only; current outcomes and owner authorizations are recorded above.


September 19, 2026. Branch: `codex/phase375-technical-bakeoff`. Exact architecture baseline: `cb7f6be2fb513de13604d381046a3240f3261383`. The owner accepted the offline foundation at `68126be972b2fdecfd650fde08d64f8b768eec01`; **this correction awaits owner review**.

**Zero live model calls; $0 model charges.** No Gateway key is requested at this checkpoint. No production runtime, migration, root dependency, accepted contract, campaign data or application configuration changed. No merge to main, deployment or implementation sprint. [Exact correction file list](experiments/phase375-bakeoff/results/changed-files.txt).

## Current official facts and privacy boundary

Public official pages were rechecked on **September 19, 2026**, before editing. Direct unauthenticated provider-catalog retrieval: **19:03:18.6868831 UTC**; model-page retrieval: **19:03:41.8389150 UTC**. These were documentation GETs, not inference. Sources/findings are frozen in [external-facts.mjs](experiments/phase375-bakeoff/src/external-facts.mjs).

- `typesafe-ai/jev` remains the documented evaluation path through `experimental_evaluate` and `gateway.evaluationModel(...)`, with typed questions and explicit instructions. [Evaluation documentation](https://vercel.com/docs/ai-gateway/modalities/evaluation).
- The rendered catalog lists approximately **$0.04/M input**; direct HTML metadata contains **$0.042/M input and $0 output**. Use the paid rate for planning. Some official text still advertises a promotion, but this budget assumes no free period. Recheck before a live run. [Jev catalog](https://vercel.com/ai-gateway/models/jev), [provider listing](https://vercel.com/ai-gateway/models/providers/typesafe-ai).
- The provider listing shows **neither ZDR nor No Training indicators**. However, the model-page metadata and [launch announcement](https://vercel.com/changelog/typesafe-ai-jev-now-available-on-ai-gateway) assert support. This is conflicting official evidence: absence establishes neither support nor definitive non-support. Exact-route capability remains **unverified**.
- **Synthetic evaluation:** newly authored fictional records only. Both profiles omit ZDR/no-training filters and claim neither guarantee. Hard provider pins remain. This policy requires no subscription upgrade. OpenAI `store: false` remains a request option, not a general retention guarantee.
- **Production privacy eligibility:** Jev is **NOT_ELIGIBLE** for real campaign/private/source inputs pending resolution against a future approved policy. Synthetic quality cannot promote it. Neither experimental profile is authorized for real data.

The no-training filter is available without a paid-plan prerequisite; it excludes unknown agreements when requested and has BYOK limitations. [No-training documentation](https://vercel.com/docs/ai-gateway/security-and-compliance/disallow-prompt-training). `only` restricts routing; `order` is preference. No fallback list or alternate provider is configured. [Routing documentation](https://vercel.com/docs/ai-gateway/models-and-providers/provider-filtering-and-ordering).

## Frozen benchmark

Protocol SHA-256: `5b8f0afccc8c2c4eeddbadb098188d1127cd3c3b58c7c98840706b171aac0a5d`.

| Split | Snapshots | All records | Authorized | Relevant | Critical subset | EN / RU |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Development/calibration | 16 | 400 | 320 | 192 | 32 | 8 / 8 |
| Held out from calibration | 32 | 800 | 640 | 384 | 80 | 16 / 16 |

Each snapshot has **20 authorized candidates: 12 relevant, 2 unresolved, 6 irrelevant**, plus five rejected boundary records. Each family has four development/eight held-out snapshots, balanced by language. Separate authored files cover [Threads](experiments/phase375-bakeoff/src/scenarios-thread.mjs), [Actors](experiments/phase375-bakeoff/src/scenarios-actor.mjs), [source/canon passages](experiments/phase375-bakeoff/src/scenarios-source.mjs) and [simulation comparisons](experiments/phase375-bakeoff/src/scenarios-comparison.mjs).

There are 48 distinct causal structures and 960 distinct authorized texts. The generator supplies stable opaque IDs, scopes and projections, not noun-substitution prose or translated held-out clones. English orchard graft/frost/water dependencies differ from Russian renamed-guarantor/ferry debt logistics; prisoner-release authority differs from archival witness chronology; expiring island rules differ from generator energy/revision constraints; delayed flood exposure differs from embassy commitments and consent.

Cases cover deadlines, indirect and cross-season causes, negation, aliases and distinct namesakes, resource competition, superseded facts, conflicting testimony, unknown evidence, agency, weak lexical overlap, plausible thematic distractors and hostile quoted instructions. Russian scenarios use independently authored situations and language. Five synthetic private/foreign-campaign/wrong-branch/stale/unknown-to-actor records are rejected before classification, even with mandatory-looking flags.

Gold labels and citation sets are explicit authored expectations, never a frontier answer. No gold/protection flags or rejected content enter payloads. Splits, thresholds, profiles, request contracts, sentinel gold/order and call manifest are frozen before live evaluation. [Protocol](experiments/phase375-bakeoff/fixtures/frozen-protocol.json), [preparation/request sizes](experiments/phase375-bakeoff/results/preparation.json).

## Eight sentinel comparisons and correctness scoring

All 48 snapshots get two classifier calls. **Only eight preselected held-out scenarios get strong-resolver A/B/C calls:**

| Family | English sentinel | Russian sentinel |
| --- | --- | --- |
| Thread | `orchard-smoke` | `ferry-debt` |
| Actor | `treaty-release` | `archive-witness` |
| Source/canon | `island-veto` | `hospital-generator` |
| Comparison | `flood-branches` | `embassy-delay` |

**A:** deterministic candidates → Astra. **B:** deterministic → Jev admission → Astra. **C:** deterministic → Astra classification → Astra. Rotated A/B/C order is frozen. No resolver calls measure bytes/latency on other snapshots.

Each sentinel has six authored statements: **48 findings per path**. The resolver returns `supported / contradicted / unresolved`, evidence IDs and campaign/timeline/revision/actor scope. A correct finding needs the expected status, every required citation and exact scope. The request contains statements but no expected answers/citation sets. Parsing rejects invented IDs, duplicates and extra fields while wrong conclusions remain scoreable.

[Scoring](experiments/phase375-bakeoff/src/resolver.mjs) reports status/citation correctness, unsupported assertions, unresolved misses, scope failures, paired quality differences and findings lost versus A. A failed/missing baseline makes the comparison incomplete, never an artificial improvement. Tests show that dropping a nonmandatory dependency reduces quality even if a model guesses the right answer. No prose judge or extra model call is used. Live results will include `sentinel-quality.json` and paired summaries.

This is a strict evidence rubric, not universal reasoning validation. Other defensible citations can fail the fixed rubric; investigate without tuning held-out gold after results. Eight scenarios and correlated findings cannot establish general causality. Baseline A failure requires review rather than comparison against equally wrong answers.

## Admission policy and offline results

Retain uncertain/omitted/malformed/uncalibrated/stale outputs and failures. Only valid explicit irrelevance with probability ≥0.99 can prune after all 16 development cases provide **288 known-label scores**, ECE ≤0.05, Brier ≤0.1 and zero raw critical misses. Mandatory evidence bypasses pruning after authorization. Overflow pauses without truncation. Classification has no mutation authority.

Adoption requires recall ≥0.995 and candidate Wilson lower bound ≥0.99; zero raw/protected critical misses, uncertainty losses or scope leaks; complete sentinel evidence and correct baseline A; no per-finding loss or unsupported claims; ≥10% paired context savings with classifier overhead, latency and cost reviewed. Privacy/owner adoption are separate gates; no automatic adoption exists.

Offline deterministic retention: **384/384 relevant, 80/80 critical, 64/64 unknown**, zero scope leaks. Zero relevant misses yields Wilson lower bound **0.990095**; one miss fails 0.99. Candidates are dependent: a 32-scenario bootstrap is also reported; zero-miss bootstrap bounds are degenerate. A hostile all-irrelevant stub protects critical evidence but loses 304 other relevant items. These are harness tests, **not model results**. Actual model quality/calibration/latency/savings/billing remain null. [Offline results](experiments/phase375-bakeoff/results/offline-summary.json).

## Revised calls and budget

| Stage | Calls |
| --- | ---: |
| Smoke: unchanged plan/narration/feedback/summary schemas + Jev transport | 5 |
| Development classification: 16 × 2 | 32 |
| Held-out classification: 32 × 2 | 64 |
| Sentinel resolvers: 8 × A/B/C | 24 |
| Normal total including smoke | **125** |
| Separately approved diagnostic headroom | **3** |
| Absolute total including all stages | **128** |

Smoke: **8 requests maximum / $3 key budget, no reset**, normally five. Three diagnostics are shared headroom, not replenished after smoke; the ordinary CLI cannot use them automatically. Smoke checks authentication, hard pins, routing identity, cost metadata, the four unchanged domain schemas and Jev transport. Mock tests exercise safe errors; no paid negative probe is silently added. Unknown routing/billing or repeated failures stops work for review.

Proposed cumulative key budget: **$30 including smoke**, no reset, one request at a time, zero retries. Fresh price review is required. Observed Astra rates are **$10/M input / $50/M output**. Reserve `(12,000 payload bytes + 2,048 framing tokens) × $10/M + 4,096 output tokens × $50/M = $0.34528` per request; count each byte as a token conservatively. [Astra catalog](https://vercel.com/ai-gateway/models/gpt-6-astra).

Jev reserve is **$0.02 per request**, above 24 repetitions of the full 14,048-token allowance at $0.042/M. Maximum **79 Astra +49 Jev** reservations total **$28.25712**. This is not a verified billing formula: smoke must inspect actual accounting, reasoning usage and reported cost. Largest prepared request: **9,965 bytes**, below 12,000. Timeout: 60 seconds; Astra output cap: 4,096. Remaining budget never authorizes extra calls.

A frozen manifest and durable reservation ledger protect request/cost limits; failed or uncertain billing remains reserved. A process lock prevents parallel runs, and rerunning never resets spending or automatically retries failures. Key budgets add protection but can lag and permit in-flight completion; BYOK bypasses them. No reset/top-up/subscription purchase is authorized. [Budget documentation](https://vercel.com/docs/ai-gateway/observability-and-spend/budgets), [live plan](experiments/phase375-bakeoff/results/live-plan.json).

## Verification and next boundary

- Experiment typecheck, lint, build, offline replay and **64 tests passed**. HTTP transports are injected mocks, including Jev, routing, errors and unchanged domain parsers.
- Unchanged application typecheck, lint, production build and **21 runtime/summary tests passed**. Generated Next declarations restored. Full application/HTTP/browser/database acceptance was not rerun.
- SDK/dependencies unchanged: `ai@7.0.107`, `@ai-sdk/gateway@4.0.87`, isolated TypeScript `7.0.2`. No installation in this correction. [Verification](experiments/phase375-bakeoff/results/verification.json), [commands](experiments/phase375-bakeoff/COMMANDS.md).
- Frozen profiles, provider pins, no fallback/retry, strict parsers and safe allowlisted metadata remain. Model-ID echo is not execution proof. Raw headers/errors, provider explanations and reasoning are not persisted. Actual routing/billing/privacy and generative-provider replaceability remain unverified.
- Physical iPhone/Safari and optional historical Phase 1 conflict-rebase remain unverified. Finite synthetic tests do not guarantee memory, branching or recovery. No hosted deployment or real campaign/private-data acceptance. Original checkout documentation remains untouched.

**Stop for owner review before requesting credentials or running smoke.** [Owner setup](experiments/phase375-bakeoff/OWNER_SETUP.md) is for a later explicitly approved stage. **DO NOT ADOPT** live pruning without quality, privacy and owner gates. classifier.dev/OpenRouter/GLiNER/Workflows remain deferred and were not contacted or integrated. No implementation sprint has begun.
