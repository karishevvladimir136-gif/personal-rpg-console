# Playtest 2.0 — World Logic turn latency

**Scope:** Review branch from `84179228a98e6ada0c4249801ebf7400f6014acf`. The benchmark used only synthetic fixtures and the existing strict `world.resolve` provider. It made 16 real resolver requests, no narration or image request, and no owner database write.

## Blocking call path

```text
submitTurn
  → authorize/read current turn and preflightMemory (ordinary Memory reads)
      → memory.summary only on context pressure or rebuild, at most two jobs
  → runTurn begin/claim
  → prepareWorldLogic: read current World authority/local routes
      → pin execution profiles; world.resolve action (model request)
      → resolveWorldLogic validation; checkpoint
  → prepareWorld: deterministic World settlement
      → optional second world.resolve request only if stageWorldTransition
        reports resolver_required for World thread/step resolution
  → prepareFoundation: deterministic settlement, if applicable
  → memoryAwareProvider.narrate: ordinary Memory retrieval
      → dm.narrate (model request); checkpoint
  → atomic turn commit: Scene, World/runtime events and existing Memory indexing
```

The resolver and narrator are sequential because narration receives validated outcomes. Ordinary Memory reads and index triggers do not invoke a model. `preflightMemory` calls `memory.summary` only if its input estimate exceeds 80% of the bounded budget with exact events, or context construction requires a rebuild. FRAME and other media have separate, explicit endpoints and are outside the blocking Game turn path. A World thread transition can add a second `world.resolve` request; the two completed owner turns below did not have one.

## Read-only owner baseline

The real local database supplied turn timestamps, checkpoint usage and pinned execution profiles. Both recent completed World Logic turns pinned **gpt-6-astra / xhigh** for resolver and narration. The local app's `OPENAI_DM_REASONING=xhigh` overrides the source-code application default of High. No owner transcript or private content was extracted.

| Turn created (UTC) | End-to-end | Resolver | Narration | Resolver tokens in/out | Narration tokens in/out | Provider time resolver/narration |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 2026-10-01 04:16:59 | 28.489 s | 8.502 s | 19.717 s | 3,653 / 403 | 8,576 / 991 | 30.1% / 69.9% |
| 2026-10-01 05:36:37 | 44.901 s | 11.740 s | 32.787 s | 4,348 / 429 | 9,822 / 1,312 | 26.4% / 73.6% |

Three other recent World Logic turns failed after one resolver call and never reached narration. Their recorded resolver latencies were 24.973 s, 44.530 s and 46.350 s. Turn timestamps include roughly 0.3 s of non-provider work in each completed sample; they do not isolate browser/network presentation latency. This is a two-turn completed baseline, not a population estimate.

## Frozen paired resolver benchmark

The eight synthetic inputs and authority checks are frozen in `scripts/playtest-turn-latency.mjs`. Each High/Medium pair used the same input, instructions, JSON schema, model family and Standard service tier; request hashes matched after excluding only the reasoning effort. The script enforced a 16-request cap and used the provider's existing attempt observer. The original and offline-rechecked results are in ignored `test-results/turn-latency/` files. The post-call offline recheck corrected two benchmark-checker mistakes: it accepted an existing `walking` capability on a validated local route, and passed only the action portion of a valid foundation envelope to `resolveWorldLogic`. It made no additional provider requests.

| Case | High latency | Medium latency | Authority result |
| --- | ---: | ---: | --- |
| Current public description | 7.096 s | 4.077 s | Both direct, no changes |
| Attributed local rumor | 5.777 s | 4.886 s | Both reported, no changes |
| Ordinary Location authoring | 6.457 s | 4.071 s | Both one bounded blacksmith Location |
| Validated local movement | 11.174 s | 8.734 s | Both use supplied local route; Medium also cites existing `walking` capability |
| Hidden truth | 7.153 s | 4.266 s | Both pause without establishing a culprit |
| Harmless unusual action | 9.948 s | 6.390 s | Both stage without mechanical changes |
| Foundation merchant quote | 16.750 s | 9.436 s | Both produce a quote proposal, no transfer |
| Missing chest/key evidence | 7.873 s | 4.567 s | Both pause without effects |

| Metric, 8 calls per profile | Astra High | Astra Medium |
| --- | ---: | ---: |
| Authority cases passed after offline recheck | 8/8 | 8/8 |
| Structured-output/transport failures | 0 | 0 |
| Median latency | 7.513 s | 4.727 s |
| Nearest-rank p75 latency | 9.948 s | 6.390 s |
| Median input tokens | 2,453.5 | 2,453.5 |
| Median output tokens | 285 | 165 |
| Total input tokens | 20,794 | 20,794 |
| Total output tokens | 2,707 | 1,663 |

The median resolver improvement was **2.787 s (37.1%)**; all eight Medium cases were faster. Total benchmark usage was **16 real provider calls, 41,588 input tokens and 4,370 output tokens**. The candidate had no hard authority violation in this sample. High and Medium chose different harmless names for the new blacksmith and different guarded wording for secret/ambiguous cases. Medium's extra `walking` reference was a supplied actor capability, not a forged route or transfer.

These are one-shot synthetic comparisons with about 2.45k input tokens per resolver call. The owner baseline used 2.8k–4.4k resolver input tokens and xhigh reasoning, so neither the exact savings nor real end-to-end quality can be inferred from this sample. Final narration quality was not benchmarked or changed.

## Reviewed-scope policy change

For a **new World Logic Game operation only**, the application now supplies task-specific defaults when it pins profiles: `world.resolve = gpt-6-astra / medium` and `dm.narrate = gpt-6-astra / high`. This selection applies when the local global Astra reasoning is High or xhigh, addressing the current owner environment without editing `.env.local`. Existing explicit campaign primary and per-task selections retain precedence; already-pinned operation profiles replay unchanged. Console Basic, World Lab, feedback, Memory summary, media and the global gameplay default retain their prior profile selection. The production settings display and read-only Game configuration projection show the same effective World Logic defaults. No resolver prompt, schema, authority validator, narration prompt or persistence model changed.

The optional second World thread resolver shares the operation's `world.resolve` profile, so it would also use Medium on a new World Logic Game turn. The eight-case benchmark measured the action resolver and did not separately benchmark a thread-advance model request. Deterministic World thread, settlement, save and recovery tests remain the authority regression gate. The code is isolated for review and is not active in the running owner app.

## Verification and status

Focused reported-conversation, Living World, World Logic/provider, Memory, save, timeline, recovery and profile tests: **158/158 passed**. The first complete run found one client import-boundary regression from sharing the default helper through a server-only folder; the pure rule was moved into the existing client-safe production area and the boundary test passed. The final complete suite passed **1,827 tests: 1,826 passed, 0 failed, 1 existing skipped**. Typecheck, repository-wide zero-warning lint and production webpack build passed. The isolated preview server was stopped. No migration, owner database/campaign mutation, owner app activation, deployment or main update occurred.
