# Astra-primary latency L1 — isolated review candidate

**Status (2026-10-06):** Measured synthetic latency sprint. The only production candidate change is **Astra High for private planning and Astra Medium for public narration**, with the existing Standard/default service tier. No owner activation, migration, deployment, or real-campaign turn occurred. The branch starts at accepted production `0371ef398f7525978dad2e33259c61bf2c0ca5d7`; the owner app's `RPG_ASTRA_PRIMARY_P1=0` setting was left alone.

The reviewed design remains one Astra DM with server-owned dice, private interpretation, a separate public-safe narration projection, durable receipts, and the existing TurnStore/Migration-38 validators. No Memory, Canon, Craft, Character Model, or public DTO authority changed.

## Method and limits

The [synthetic benchmark harness](scripts/astra-primary-latency-l1.mjs) ran the actual production Astra-primary provider/runtime against disposable PGlite migration-38 campaigns. Each fixed scenario used synthetic Mara, Orin, the Copper Lantern, the Old Mine, an oil flask, and a Mine Stalker. Server rolls used the accepted deterministic schedule; no model-authored die was accepted. The five scenarios were quiet dialogue without a tool, known-Location travel without a random tool, an uncertain skill check, an attack plus damage, and a Focus-spending attack plus damage/Orin reaction. The last is a multi-request tool turn, though it requested only two generic tools in these runs.

The main comparison made two independent repetitions per scenario for Standard High, Standard Medium narration, Standard Low narration, Fast High, and Ultrafast High: **50 committed, state-valid synthetic turns and 150 provider requests**. Additional cache, WebSocket, streaming, and harness-diagnostic runs brought the audit to **63 synthetic turns, 182 provider requests, and approximately US $28.5143**, below the $40 ceiling. One early quiet turn committed correctly but the initial harness incorrectly rejected its legitimate one-minute clock advance; that false-negative is excluded from performance comparisons and retained in the spend audit. All later measured scenarios passed their state checks. Per-request metadata, timings, and numeric before/after state without raw private output are in [ASTRA_PRIMARY_LATENCY_L1_DATA.json](ASTRA_PRIMARY_LATENCY_L1_DATA.json).

Each aggregate p95 below is the nearest-rank p95 of **ten turns across five different workloads**, rather than a production tail-latency guarantee. A per-scenario two-run p95 is simply the slower observation. Provider queueing and generation variance remain visible.

## Baseline waterfall

Times are milliseconds, nearest-rank medians of two repetitions per scenario. “Planner” includes all private Astra requests and continuations; the provider requests within that total are listed individually in the data file. “Tool” is server execution plus durable receipt persistence. Memory includes plan/public retrieval, while preflight is separately measured and can overlap that total. The tiny context columns are CPU assembly/serialization after Memory.

| Synthetic turn | Requests | Preflight | Memory retrieval | Private context | Planner and continuations | Tool + receipt | Public context | Narrator | Final commit | Total |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Quiet dialogue | 2 | 11 | 11 | 2 | 21,354 | 0 | 1 | 14,071 | 18 | 36,337 |
| Known travel | 2 | 14 | 18 | 2 | 23,259 | 0 | 1 | 15,138 | 7 | 38,480 |
| Skill check | 3 | 10 | 21 | 2 | 14,664 | 2 | 1 | 15,307 | 5 | 31,089 |
| Attack + damage | 4 | 16 | 22 | 2 | 18,931 | 6 | 1 | 12,362 | 7 | 33,658 |
| Multi-tool attack | 4 | 12 | 30 | 1 | 29,485 | 4 | 2 | 14,344 | 13 | 43,946 |

Individual generic tool computation plus persistence took approximately **2–15 ms** in the checked tool turns. The current 35–60 seconds are overwhelmingly sequential provider time: private planning/continuation and the separate public narrator. Local Memory, context assembly, dice, receipts, and atomic commit were measured in milliseconds. Collapsing private planning and public narration would break the public-safe boundary, so that request remains.

## Main configuration comparison

All rows use `gpt-6-astra/high` private planning, direct HTTP Responses, `store=false`, and the same five synthetic cases. Each row is 10 turns, 30 requests, and 10/10 validated commits. Token columns are **total** tokens across the row. Latencies are seconds; price is estimated US dollars per turn.

| Narrator | Tier | Requests / turn | Input / cached / hit | Output / reasoning | Planner p50 / p95 | Narrator p50 / p95 | Total p50 / p95 | First visible narration | Cost / turn | Quality/state |
| --- | --- | ---: | --- | --- | ---: | ---: | ---: | --- | ---: | --- |
| Astra High | default | 3.0 | 144,966 / 12,302 / 8.5% | 14,318 / 8,826 | 21.35 / 39.48 | 14.64 / 18.29 | **36.34 / 53.93** | After full commit | $0.239 | 10/10 pass |
| Astra Medium | default | 3.0 | 144,702 / 12,090 / 8.4% | 10,186 / 4,937 | 19.83 / 34.24 | 5.51 / 6.10 | **25.35 / 39.87** | After full commit | $0.218 | 10/10 pass |
| Astra Low | default | 3.0 | 144,945 / 12,160 / 8.4% | 10,568 / 4,927 | 24.18 / 40.88 | 6.25 / 7.89 | **30.56 / 48.83** | After full commit | $0.220 | 10/10 pass |
| Astra High | fast | 3.0 | 145,739 / 12,302 / 8.4% | 14,352 / 8,832 | 14.39 / 26.03 | 9.83 / 11.35 | **23.44 / 35.37** | After full commit | $0.480 | 10/10 pass |
| Astra High | ultrafast | 3.0 | 144,197 / 12,142 / 8.4% | 15,141 / 9,557 | 6.58 / 8.63 | 4.10 / 10.27 | **10.82 / 15.70** | After full commit | $1.452 | 10/10 pass |

Medium narration improved measured total p50 by **30%** and p95 by **26%** against High, with the planner unchanged. Low passed the narrow state/voice check but was slower and more variable than Medium. Both paid tiers were accepted and echoed by the provider. Fast improved p50 by **35%** at about **2.0×** cost. Ultrafast improved p50 by **70%** at about **6.1×** cost; rate limits and the ten-turn sample preclude treating it as a default owner setting.

The five fixed cases retained validated Location/time, skill/attack/damage receipts, Stalker HP loss, Focus spend, no extra item or resource change, and no private disclosure. Manual inspection of the public synthetic outputs found Orin's tired/direct voice, his independent caution, the father's-map promise callback, and the exact server roll consequences in High, Medium, Low, Fast, and Ultrafast examples. There was no observed automatic heroic authority or invented reward. This is a bounded parity check, not an owner blind quality study. Low is the lowest level that passed this limited quality gate; **Medium is the latency choice** because Low did not improve on Medium in either measured narrator or total latency.

## Cache, continuation, and streaming studies

| Study | Planner / narrator | Tier / transport | Turns; requests / turn | Input / cached / hit | Output / reasoning | Planner p50 / p95 | Narrator p50 / p95 | Total p50 / p95 | First visible narration | Cost / turn | Result |
| --- | --- | --- | --- | --- | --- | ---: | ---: | ---: | --- | ---: | --- |
| Existing same-campaign repeat | High / Medium | default / HTTP | 2; 2.0 | 23,911 / 1,208 / 5.1% | 1,837 / 995 | 22.08 / 23.34 | 6.23 / 6.26 | 28.43 / 29.65 | After commit | $0.188 | 2/2 pass |
| Explicit cache, separate campaigns | High / Medium | default / HTTP | 4; 2.0 | 35,101 / 0 / 0% | 4,429 / 2,663 | 28.37 / 37.54 | 5.33 / 7.33 | 32.77 / 43.07 | After commit | $0.148 | 4/4 pass; no cache hit |
| Explicit cache, same campaign | High / Medium | default / HTTP | 2; 2.0 | 24,490 / 1,864 / 7.6% | 1,768 / 911 | 24.28 / 25.43 | 6.43 / 7.96 | 30.81 / 33.49 | After commit | $0.161 | 2/2 pass; slower |
| Incremental WebSocket receipts | High / High | default / WebSocket planner, HTTP narrator | 2; 4.0 | 40,984 / 11,033 / 26.9% | 3,226 / 1,717 | 17.56 / 34.28 | 16.95 / 22.21 | 34.64 / 56.57 | After commit | $0.273 | 2/2 pass; no wall-time gain |
| Streamed public response, buffered for validation | High / Medium | default / HTTP SSE narrator | 2; 3.0 | 28,876 / 2,392 / 8.3% | 1,779 / 736 | 19.72 / 23.09 | 5.07 / 6.27 | 26.09 / 28.26 | After commit | $0.211 | 2/2 pass; no UI stream |

**Cache diagnosis.** The current serialized packet puts dynamic campaign/input/state before optional Craft, and the strict planning schema embeds campaign-specific eligible IDs. Both reduce reusable exact prefixes. The synthetic explicit-breakpoint experiment placed stable settings, guide body, and Craft ahead of dynamic state without trimming Canon or Memory. Across separate campaigns it yielded **zero** cached tokens. On the second turn of one campaign, its planner reported **1,864 / 8,543 = 21.8%** cached input versus **1,208 / 8,258 = 14.6%** for the existing layout, a **7.2-point planner hit-rate gain**. Across both requests on that second turn, the hit rate rose from **8.0% to 11.9%**, a **3.9-point gain**. Narration remained at zero cached tokens, and the experimental turns were slower. The prompt layout is therefore **not proposed for production**. The provider's [prompt-caching guide](https://developers.openai.com/api/docs/guides/prompt-caching) explains why an implicit full-request cache or a breakpoint below a reusable prefix can fail to match changed dynamic suffixes.

**WebSocket continuation.** The isolated planner prototype used one `store=false` connection, `previous_response_id`, and only the newly durable server-owned receipt on each continuation. It kept the public narrator on a separate HTTP request and still passed the production validators/commit. The attack and Focus-attack request bodies totaled about **39–40 KB** each with WebSocket continuation versus **67–68 KB** for baseline HTTP, about 40% fewer bytes. Provider-billed input remained about **20–21K tokens per turn**, request count stayed **four**, and total latency did not improve in two runs. OpenAI documents that `store=false` continuation state is [connection-local and unavailable after cache loss](https://developers.openai.com/api/docs/guides/websocket-mode); a production retry would have to rebuild from Console's durable source and receipts. No WebSocket code is proposed for production in L1.

**Streaming.** A synthetic SSE wrapper measured the first output-text delta **1.735 / 1.803 s** into the narrator requests, and the first narration-value character **1.847 / 1.905 s** into them (quiet / attack). That was roughly 21.7 / 25.1 seconds after the turn began. Actual player-visible text in the current product still waits for full response validation, private-disclosure checking, durable narration checkpoint, and atomic commit: **26.09 / 28.26 s** in these two runs. The harness buffered the whole stream before returning it to the production parser; it never published partial JSON. A safe partial-display policy is separate work.

## Cost and recommendation

Prices above are estimates from measured provider usage at the [published Astra short-context rates](https://developers.openai.com/api/docs/pricing): Standard $10/M uncached input, $1/M cached input, $12.50/M cache writes, $50/M output; Fast approximately 2× these rates; Ultrafast approximately 6×. Cache-write tokens are accounted separately. Actual billing may differ by project/region or future pricing. The **$28.5143** audit includes all 182 requests, including the one early harness false-negative.

**Review recommendation:** retain `gpt-6-astra/high` planning and `service_tier=default`; adopt `gpt-6-astra/medium` only for the public narrator. This is the smallest measured production change with repeatable latency and cost improvement while preserving the two-stage privacy boundary. The isolated branch implements precisely that provider setting and its focused regression. It does **not** yet meet the aspirational 10–15 s quiet or ≤20 s travel target. Ultrafast met those targets in this synthetic set, but its 6× price and limited sample make it an explicit owner trade-off rather than a default. Request count did not improve: 2 for quiet/travel, 3 for skill, 4 for attack/multi-tool in all comparable HTTP configurations.

No migration was needed. The owner database stayed at migration 38; no real campaign, save, running app flag, or deployment was changed. No change to Memory retrieval, mandatory evidence, privacy projection, server dice, tool receipts, state validation, or Migration-38 authority was made.

## Verification

- Focused Astra-primary/provider/acceptance/soak/migration-38 plus privacy SQL/policy: **39/39 passed**.
- Complete suite against an isolated preview on port 3131: **1,935 passed / 1,936 total**, zero failures, one existing skip. Preview stopped.
- TypeScript route generation/typecheck: passed.
- Repository ESLint with `--max-warnings=0`: passed.
- Production Next.js webpack build: passed.
- Branch-only changed areas: private/public provider reasoning selection, regression test, synthetic benchmark harness, sanitized measurement data, this report, and `DEV_STATUS.md`.

Owner review is required before merging or activating this configuration.
