# Phase 3.75 technical bake-off — offline checkpoint

September 19, 2026. Exact baseline: `cb7f6be2fb513de13604d381046a3240f3261383`. Branch: `codex/phase375-technical-bakeoff`.

**Offline preparation verified; live evaluation blocked pending owner authorization. Zero live model calls, $0 model charges from this experiment.** This is not a completed model-quality benchmark or production adoption. No experimental runtime/dependency changes may merge to main. Production gameplay, Memory, Saves, migrations and accepted contracts are unchanged.

## Recommendations at this checkpoint

| Area | Recommendation |
| --- | --- |
| Model Runtime transport | Continue the bounded Gateway experiment; keep the direct OpenAI implementation as the production reference. Do not adopt Gateway until live schema, identity, privacy and failure checks pass. |
| AI SDK | Transport/schema plumbing behind `DmProvider` / `SummaryProvider` only. No agent loop, tools with mutation authority, new state store or workflow framework. |
| Decision Model | **DO NOT ADOPT for live pruning at present: evidence is incomplete.** This is not an adverse measured finding about Jev. Consider reranking-only if later evidence shows critical misses, unreliable uncertainty or trivial savings; pruning requires the frozen recall gates and owner review. |
| classifier.dev | Optional external comparator only, separately authorized; no smart tier and no requests made. |
| OpenRouter | Future escape hatch only after a measured Gateway capability/model gap justifies another transport. |
| GLiNER | Future Phase 3.75B EN/RU entity-and-relation extraction benchmark; no Python backend or integration. |
| Vercel Workflows | Deferred until existing Postgres durable jobs demonstrably become insufficient. |

Registry entries are descriptive, versioned capability/compatibility data. An execution adapter makes calls; an optional `DecisionModelProvider` / `ClassificationProvider` performs evaluation. Neither is domain authority. Existing server parsers, knowledge filtering, mechanics and authoritative commits remain outside the transport.

## Track 1 evidence

Pinned experiment: `ai@7.0.107` (stable npm `latest` when inspected), `@ai-sdk/gateway@4.0.87`; TypeScript `7.0.2`, Node `24.19.0`, pnpm `11.19.0`, `@types/node@24.13.6`, ESLint / `@eslint/js@9.39.5`. The last pair stays on the app's lint major, despite its registry deprecation warning. Exact transitives are in the isolated lockfile; root manifests/lockfile are unchanged.

| Purpose | Model ID | Hard provider pin | Options |
| --- | --- | --- | --- |
| Existing DM schemas, summary, frontier classifier and strong resolver | `openai/gpt-6-astra` | `only: ["openai"]` | `reasoningEffort: "xhigh"`, `store: false`, maximum 4096 output tokens |
| Decision candidate | `typesafe-ai/jev` | `only: ["typesafe-ai"]` | `experimental_evaluate`, typed choice questions with explicit uncertainty |

Gateway documents `only` as the restriction, while `order` merely expresses preference. The experiment sends no fallback model list or provider order; retries are zero. Profiles are deeply frozen before use. [Provider routing](https://vercel.com/docs/ai-gateway/models-and-providers/provider-filtering-and-ordering).

The installed SDK, using injected mock HTTP, transmits the **unchanged plan, narration, feedback and source-selection summary schemas** and applies their independent domain parsers. Tests cover malformed/refused/incomplete responses, option warnings, unsupported configuration, 400/401/403/404/402/429/503, wrong provider/model, absent routing and timeout. The spike's 12,000-byte request cap is smaller than production context budgets; it does not change the production context builder. No automatic model/provider replacement is configured.

Jev uses the documented evaluation API, not a chat completion or classifier.dev. The SDK's evaluation adapter sets `response.modelId` to its requested ID; that echo is **not proof of actual execution**. This harness requires allow-listed routing evidence and stops when identity cannot be verified. It retains only model/provider IDs, bounded numeric usage/cost/latency, attempt counts and a profile hash; prompt-bearing routing explanations, raw errors, headers and reasoning are excluded. [Evaluation API](https://vercel.com/docs/ai-gateway/modalities/evaluation); installed adapter source is version-pinned in the lockfile.

Both profiles request `zeroDataRetention: true` and `disallowPromptTraining: true`; mock wire checks establish only that these options are sent. Account entitlement, provider compliance/availability, observed routing and actual retention are **not live-verified**. Vercel documents ZDR availability for Pro/Enterprise; an unavailable compliant route must fail, not relax policy. [Privacy controls](https://vercel.com/i/secure-ai-gateway).

No provider has been newly live-verified here. Two different provider IDs in fixtures do not establish general generative-provider replaceability; that still needs at least two separately verified providers.

## Track 2 protocol and offline results

[Generator](experiments/phase375-bakeoff/src/fixtures.mjs), [frozen protocol](experiments/phase375-bakeoff/fixtures/frozen-protocol.json), [preparation](experiments/phase375-bakeoff/results/preparation.json), [raw offline decisions](experiments/phase375-bakeoff/results/offline-decisions.json), [offline summary](experiments/phase375-bakeoff/results/offline-summary.json).

Protocol SHA-256: `a0e853cbd6bcab495af5ef428712a74f1e0ee70a01d9adf8d7bed250074fdbc9`.

| Split | Snapshots | Candidate records | Authorized candidates | Critical subset | EN / RU snapshots |
| --- | ---: | ---: | ---: | ---: | ---: |
| Development/calibration | 32 | 672 | 512 | 160 | 16 / 16 |
| Held out from calibration | 64 | 1344 | 1024 | 320 | 32 / 32 |

Four families cover Threads, Actors, canon passages and parallel-outcome comparisons. Explicit fixture rules supply gold; models never see gold/protection flags. Opaque candidate IDs and permuted order prevent shared label codes. Cases include paraphrases, negation, conflicts, deadlines, direct targets, agency warnings, dependencies, aliases, unknowns, distractors and hostile source instructions. Five forbidden records per snapshot test campaign, private, branch, revision and actor-knowledge exclusion before any model input.

Planned paths use identical authorized snapshots: A deterministic → Astra resolver; B deterministic → Jev → protected admission → Astra; C deterministic → Astra classification → protected admission → Astra. Raw label confusion and raw admission are reported separately from mandatory protection and resolver acceptance.

Frozen policy: retain uncertainty, omissions, absent/invalid scores, stale results and failures. Only an explicitly irrelevant label with probability ≥0.99 can prune, after the development calibration gate (identity scores, 10-bin ECE ≤0.05, Brier ≤0.1, complete successful development coverage and no raw critical miss). No held-out tuning. Mandatory evidence always survives scope-authorized pruning. Overflow pauses with retained evidence intact. Adoption requires held-out recall ≥0.995, Wilson lower bound ≥0.99, no raw/protected critical misses, no scope leaks or lost required uncertainty, and meaningful paired context savings (≥10%) after reviewing overhead, subgroups and failures. These are experimental gates, not universal probability semantics.

Offline deterministic admission retained **576/576 known relevant held-out items**, **320/320 critical items**, and all 64 unknown items; zero scope leaks. Candidate Wilson 95% intervals: relevant retention **99.34–100%**, critical retention **98.81–100%**. These describe constructed test cases, not model recall. A deliberately hostile all-irrelevant stub loses 320 critical items raw and zero after mandatory protection, but still loses 256 noncritical relevant items: mandatory protection alone cannot prove useful classification.

**Actual Jev/frontier recall, calibration, p50/p95 latency, savings, usage and cost remain null/unmeasured.** No stub result is attributed to a model. The prepared live runner records per-candidate normalized answers, paired resolver/classifier overhead, failures and nullable billing; raw provider diagnostics stay unrecorded.

## Verification and limits

- Experiment typecheck, lint, build and **55 deterministic tests passed**; no test sends model traffic.
- Unchanged app typecheck, production build and lint passed (experiment lint runs separately). **21 existing direct OpenAI/summary unit tests passed**, using synthetic transport stubs.
- Complete application HTTP/database/browser suites were not rerun: this experiment does not touch those paths or the running app. No live Supabase, live provider, UI/device or real-data acceptance is claimed.
- Samples are template-generated and correlated across language/family. There are only **8 held-out premise clusters**, not 1024 independent natural examples. Seeded 2000-resample cluster intervals keep all variants together; a zero-miss bootstrap is degenerate, not proof. Human review and broader naturalistic fixtures remain necessary before adoption.
- Binary pruning calibration does not validate every similarity/divergence score. Synthetic resolver ID coverage does not prove sound reasoning or universal world causality. Fixed A/B/C request order, caching, one observation per snapshot and a 60-second/4096-output cap can affect later timings/failures; report rather than hide them.
- This is a standalone server-side transport harness, not a wired production adapter or a second backend. Physical iPhone/Safari and historical optional Phase 1 conflict-rebase remain unverified; no hosted deployment or real campaign/private-data acceptance has occurred.

## Next gate — owner-controlled live work

Follow [exact local setup and bounded call plan](experiments/phase375-bakeoff/OWNER_SETUP.md). First authorize only the smoke stage: **at most 8 requests, $3 budget**, serialized, no retries. After reviewing its actual routing, billing and privacy compatibility, a separately approved full run allows **at most 392 requests total including smoke**, with a proposed **$125 total budget**. No call in either stage has occurred.

At observed Astra catalog rates ($10/M input, $50/M output), conservative token reservations total $95.816 for 295 maximum Astra calls. Jev is currently promotional free through September 25; the harness reserves an additional $0.97 contingency for 97 maximum calls, not a post-promotion rate claim. Recheck pricing/entitlements before running. Budget headroom is not permission for extra calls or retries. [Astra catalog](https://vercel.com/ai-gateway/models/gpt-6-astra), [Jev catalog](https://vercel.com/ai-gateway/models/jev).

[Exact commands and tooling notes](experiments/phase375-bakeoff/COMMANDS.md). Stop here pending owner authorization; the implementation sprint remains unstarted.
