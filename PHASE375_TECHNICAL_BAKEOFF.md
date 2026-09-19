# Phase 3.75 technical bake-off — corrected offline protocol

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
