# P0 live latency evidence — forensic only

Repository: 5fb142b7dad6406473e3d3ae77e49cc5b2d3320d. Snapshot: 2026-10-14T23:31:46.568248+00:00.

The lead captured owner state with read-only PostgreSQL SELECTs and audited the pinned source offline. The latency analysis uses those captures and existing logs. No owner mutation, retry/cancel, paid call, provider output, prompts, hidden prose or credentials are included. This report is on the isolated implementation branch; main remains unchanged.

## Latest mill failure: exact boundary

Operation `5267cd71-79c0-44e1-b24a-2d7a7c3eddea`, saved at `2026-10-14T23:24:35.700041Z` (16:24:35 PDT), input `i go to mill and ask miller for job`, is failed/validation/nonretryable, expected revision **79**, runtime `astra-primary-v1`, with no committed revision. Source exists; checks and tool receipts are zero; final proposal and private schema-2 ordered authority are pinned; narration is absent. The saved diagnostic is exactly `stage=narration_parse`, `phase=failed`, `failureCategory=validation`, `providerResponseReceived=true`, `narrationParseSucceeded=false`.

The planner and a narrator request occurred, plus one observed foreground summary (6,435 ms, 880 input / 191 output tokens, HTTP 200). The planner succeeded (32,031 ms, 16,384 input / 1,227 output tokens). A valid final was checkpointed before narration. This rules out preflight context, effect planning, mechanics and SQL commit as the latest rejection boundary. The narrator reached output parsing after a successful HTTP response. Its exact rejected JSON/field was not retained: malformed output JSON, narration contract validation and a non-null clarification all collapse at this boundary. No precise one is inferred.

`src/components/gameplay-turn.tsx` mapped both `context` and `validation` to the same more-context message. That is the exact predicate which produced the observed UI text; it does not prove context exhaustion. No gameplay commit/event/scene exists for this operation. Memory maintenance did publish a summary/checkpoint; it is not a gameplay outcome.

## Context-size replay

Current read-only Memory reassembly matches source revision **79**, timeline/epoch, generation **80**, valid checkpoint, `overflow=false`, zero uncovered exact events, and public/private watermarks **674 / 8**. Offline `withMemory` plus the real Astra builder and preflight succeeds without enqueue, claim, summary or provider work. This is current deterministic reassembly, not proof of identical historical provider bytes; those bytes were not logged.

| Component | UTF-8 bytes |
| --- | ---: |
| Required-only planner request, including reserve | 46,557 |
| Fully selected wrapped provider input | 39,339 |
| Private instructions | 5,495 |
| Dynamic strict schema | 13,192 |
| JSON escaping and request envelope | 3,463 |
| Framing reserve | 2,048 |
| Actual reconstructed HTTP JSON body | 61,489 |
| Complete selected accounting | **63,537** |
| Application cap | **64,000** |
| Remaining headroom | **463** |

Current state is 9,043 bytes; World takeover 927; settings 950; Memory checkpoint projection 5,732 (20 source references account for 4,661). Private checkpoint exactState is excluded. Five of eight selected exchange narrations also appear in selected raw scenes, matched by narration scene ID, revision and exact bytes: **2,305 UTF-8 bytes** of duplicated prose. A measurement-only larger bound retains two additional optional scenes at 64,266 bytes. No production configuration changed. The cap is a real headroom concern, but did not cause this operation's narration-parse failure.

## Measurement limits

created_at to updated_at is a durable row lifecycle window, not browser-submit-to-response latency. It may include owner waiting, cancellation and retries. Latest diagnostics have no boundary timestamps/history. Checkpoint usage records contain successful results only. Unknown values are intentional.

## Ten most recent Iris Game operations

All times are milliseconds. Input/output totals count saved successful Astra usage only.

| Operation | Literal input | Revision | Status/failure | Created-to-updated | Saved planner | Mapped Memory | Saved narrator | Saved calls | Input / output | Latest diagnostic |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| 5267cd71-79c0-44e1-b24a-2d7a7c3eddea | i go to mill and ask miller for job | 79 -> none | failed/validation | 47127 | 32031 | 6435 | unknown | 1 | 16384 / 1227 | narration_parse / failed |
| b9d2951b-369c-4039-8aff-f21edf67a1e8 | i continue to search for him | 75 -> 79 | committed | 339261 | 49170 | 11597 | 5497 | 2 | 26637 / 1950 | commit / entered |
| 67694df9-d271-49a0-8cf1-1dffcfe5850c | i go and talk to village miller | 71 -> 75 | committed | 78731 | 53810 | 16331 | 7685 | 2 | 27764 / 2290 | commit / entered |
| 221298f5-6b30-44f4-badc-066ad39e9295 | i go around village and ask for work | 67 -> 71 | committed | 3785249 | 53530 | 11430 | 7181 | 2 | 27622 / 2089 | commit / entered |
| 914a3985-2b8e-47ba-a5c3-9d920faa8e7b | okey. I wake up. go back to innkeeper  -   so! what about work? | 63 -> 67 | committed | 80110 | 32689 | unknown | 10229 | 2 | 27862 / 1490 | commit / entered |
| b97cf696-755d-4234-85b1-bc2a1cb97947 | i take long rest | 56 -> 63 | committed | 18406 | 10987 | unknown | 6881 | 2 | 27011 / 593 | commit / entered |
| 574862da-14ee-4881-a5cb-6a23f144458e | i take long rest | 56 -> none | cancelled/context | 5462960 | unknown | unknown | unknown | 0 | 0 / 0 | plan / failed |
| a049a6f8-2b5f-4fed-88f6-a9d6a01de147 | now... my reward. and i need place to sleep pls! can help you in the morning and btw. if you have any rats in your basement i know how to use sword pls | 50 -> 56 | committed | 47403 | 39198 | unknown | 7482 | 2 | 32405 / 1834 | commit / entered |
| c7503d7e-081d-483c-b764-cde009390f9f | now... my reward. and i need place to sleep pls! can help you in the morning | 50 -> none | cancelled/validation | 427307706 | unknown | unknown | unknown | 0 | 0 / 0 | plan / failed |
| 8b4cd405-d654-4fdd-93a0-49518ab608d8 | now... my reward. and i need place to sleep pls! can help you in the morning and btw. if you have any rats in your basement i know how to use sword pls | 50 -> none | cancelled/validation | 427363515 | unknown | unknown | unknown | 0 | 0 / 0 | plan / failed |

## Supported totals

- Operations: 10; committed 6, failed 1, cancelled 3.
- Saved successful Astra: 13 calls, 316370 ms, 185685 input / 11473 output tokens.
- Saved planner: 7 calls, 271415 ms, 115394 input / 10288 output.
- Saved narrator: 6 calls, 44955 ms, 70291 input / 1185 output.
- Observed Memory: 4 calls, 45793 ms, 4191 input / 1458 output.
- Actual total attempts, failed-attempt usage, reasoning/cached tokens and total cost are unknown. These totals are not all billed work.

## Recent timing decomposition

- 67694df9: 78,731 ms window = 61,495 saved Astra + 16,331 mapped Memory + 905 unassigned.
- 5267cd71: 47,127 ms window = 32,031 saved planner + 6,435 mapped Memory + 8,661 unassigned. The remainder includes failed narration/overhead and is not measured server-only time.
- b9d2951b: 339,261 ms includes unobserved retry/user wait; 54,667 ms saved Astra and 11,597 ms mapped Memory are known. The remainder is not local overhead.
- 221298f5: original-created to committed includes a long owner wait. Activation-era Memory job creation 2026-10-14T23:08:36.343362Z to final update 23:12:59.228989Z is 262,885.627 ms, not an execute/claim timer. Saved Astra 60,711 ms and mapped Memory 11,430 ms are known; gaps/retry/user wait are not measured.

## Connection interruptions

The ordinary requester uses AbortSignal.timeout(60000). One shared extra automatic retry is allowed for an explicit no-response transport failure with unchanged durable results. Two long waits are possible. HTTP errors, received-body failures and parse/validation errors do not trigger that retry.

The Next snapshot has warnings serialized as astra_plan_diagnostic {}. Pairs at relative 00:05:30.182 -> 00:06:30.199 and 00:14:45.099 -> 00:15:45.102 differ by 60,017 and 60,003 ms. This fits the deadline/retry pattern, but no operation ID or native abort metadata survives. Exact timeout causes and automatic retry counts remain unproven.

The launcher discards stdout/stderr, but Next separately persists .next/dev/logs/next-development.log. The production Astra adapter forwards phase/responseReceived only and does not install the ordinary attempt observer. Rich HTTP/native/request-ID metadata is therefore discarded. Planner-only reason logging cannot identify narration parsing defects.

## Latest mill failure

5267cd71-79c0-44e1-b24a-2d7a7c3eddea pinned a valid private final and received a narration response, then failed validation at narration_parse. Narration was not pinned. This rules out initial planner-context failure for that operation.

The current UI maps both context and validation to: The DM needs more context for this action. This is misleading.

Remaining parse predicates: invalid output_text JSON; exact narration schema rejection; or schema-valid narration with clarification !== null, rejected by Astra. The schema requires exactly narration (1–6,000 characters), visualDescription (0–2,000), clarification (null/string up to 1,000). No retained raw output or narration reason code proves the exact predicate.

## Production architecture

- Astra High private planner/continuations, then Astra Medium public-safe narrator; default tier.
- Sequential non-streaming direct HTTP Responses; strict output; no silent fallback.
- Foreground preflight can run three sequential Memory summaries, each with its own 60-second ceiling.
- Current application cap is 64,000 UTF-8 byte-upper-bound units including schema/envelope/framing, not measured model input tokens. Output reserve is 4,096.
- Route maxDuration is 300 seconds for new turns, 180 for resume; lease is 300 seconds. These settings do not prove a local observed timeout.

## Historical L1 evidence and bounded benchmark proposal

Default High/Medium total p50/p95: 25.35/39.87 seconds; estimated $0.218/turn. Fast 23.44/35.37 seconds/$0.480 and Ultrafast 10.82/15.70 seconds/$1.452 used High narration. They are not a clean comparison to current High/Medium.

Propose three synthetic Iris-sized actions (work dialogue, known travel, one meaningful skill check) across default/Fast/Ultrafast: nine cells, approximately 21 normal requests, maximum 30 including the existing one shared automatic transport retry per cell, $20 additional hard ceiling. Keep High/Medium. No owner data, Memory provider calls or quality retries. Reserve maximum cost before each dispatch; stop rather than exceed the ceiling. All nine cells are not guaranteed to fit.

Current tier prices are unverified; historical L1 estimates used 1x/2x/6x. Verify official current rates and obtain paid authorization before running. Non-streaming TTFT is unavailable unless a separate equally applied bounded streaming observer is authorized.

Two historical WebSocket tool-turns reduced bytes about 40% but retained four requests and showed no wall-time gain. No implementation is justified.

## Per-operation qualifications

### 5267cd71-79c0-44e1-b24a-2d7a7c3eddea

- Creation 2026-10-14T23:24:35.700041+00:00; last update 2026-10-14T23:25:22.827474+00:00. Durable creation-to-last-update window, not browser click-to-response stopwatch.
- Latest diagnostic narration_parse/failed; category validation; provider received true; narration parse false.
- Source true; checks 0; receipts 0; final true; narration false.
- Stored source 90317 bytes is not the request size. Claim/context/commit timing, failed attempts, reasoning/cached tokens, request IDs and native causes are unknown.
- Memory job 9d97b953-67ee-459d-aca0-b2f20f03ef32, source revision 79, 6435 ms, HTTP200, 880 input / 191 output. Revision attribution was confirmed by the lead audit.

### b9d2951b-369c-4039-8aff-f21edf67a1e8

- Creation 2026-10-14T23:17:50.931125+00:00; last update 2026-10-14T23:23:30.192921+00:00. Includes unobserved retry and/or owner wait; not continuous execution latency.
- Latest diagnostic commit/entered; category null; provider received true; narration parse true.
- Source true; checks 0; receipts 0; final true; narration true.
- Stored source 86689 bytes is not the request size. Claim/context/commit timing, failed attempts, reasoning/cached tokens, request IDs and native causes are unknown.
- Memory job 924f4e66-6234-4ead-b95a-6605348297a0, source revision 75, 11597 ms, HTTP200, 750 input / 380 output. Revision attribution was confirmed by the lead audit.

### 67694df9-d271-49a0-8cf1-1dffcfe5850c

- Creation 2026-10-14T23:15:02.032825+00:00; last update 2026-10-14T23:16:20.763617+00:00. Durable creation-to-last-update window, not browser click-to-response stopwatch.
- Latest diagnostic commit/entered; category null; provider received true; narration parse true.
- Source true; checks 0; receipts 0; final true; narration true.
- Stored source 84243 bytes is not the request size. Claim/context/commit timing, failed attempts, reasoning/cached tokens, request IDs and native causes are unknown.
- Memory job 8fb3df6a-8fd1-4dc7-a756-a6b2e1897fe3, source revision 71, 16331 ms, HTTP200, 1239 input / 599 output. Revision attribution was confirmed by the lead audit.

### 221298f5-6b30-44f4-badc-066ad39e9295

- Creation 2026-10-14T22:09:53.979175+00:00; last update 2026-10-14T23:12:59.228989+00:00. Includes preserved failure and owner wait; not execution latency.
- Latest diagnostic commit/entered; category null; provider received true; narration parse true.
- Source true; checks 0; receipts 0; final true; narration true.
- Stored source 86811 bytes is not the request size. Claim/context/commit timing, failed attempts, reasoning/cached tokens, request IDs and native causes are unknown.
- Memory job 3f02800d-5688-4d86-8c50-eff369e83cdd, source revision 67, 11430 ms, HTTP200, 1322 input / 288 output. Revision attribution was confirmed by the lead audit.

### 914a3985-2b8e-47ba-a5c3-9d920faa8e7b

- Creation 2026-10-14T22:07:44.661272+00:00; last update 2026-10-14T22:09:04.77131+00:00. Durable creation-to-last-update window, not browser click-to-response stopwatch.
- Latest diagnostic commit/entered; category null; provider received true; narration parse true.
- Source true; checks 0; receipts 0; final true; narration true.
- Stored source 82618 bytes is not the request size. Claim/context/commit timing, failed attempts, reasoning/cached tokens, request IDs and native causes are unknown.
- No attributable Memory attempt in this log snapshot; this does not establish no call occurred.

### b97cf696-755d-4234-85b1-bc2a1cb97947

- Creation 2026-10-14T05:57:20.749837+00:00; last update 2026-10-14T05:57:39.155104+00:00. Durable creation-to-last-update window, not browser click-to-response stopwatch.
- Latest diagnostic commit/entered; category null; provider received true; narration parse true.
- Source true; checks 0; receipts 0; final true; narration true.
- Stored source 74659 bytes is not the request size. Claim/context/commit timing, failed attempts, reasoning/cached tokens, request IDs and native causes are unknown.
- No attributable Memory attempt in this log snapshot; this does not establish no call occurred.

### 574862da-14ee-4881-a5cb-6a23f144458e

- Creation 2026-10-14T04:26:10.673043+00:00; last update 2026-10-14T05:57:13.63348+00:00. Includes cancellation/owner wait; not execution latency.
- Latest diagnostic plan/failed; category context; provider received false; narration parse false.
- Source true; checks 0; receipts 0; final false; narration false.
- Stored source 74021 bytes is not the request size. Claim/context/commit timing, failed attempts, reasoning/cached tokens, request IDs and native causes are unknown.
- No attributable Memory attempt in this log snapshot; this does not establish no call occurred.

### a049a6f8-2b5f-4fed-88f6-a9d6a01de147

- Creation 2026-10-14T03:43:16.147496+00:00; last update 2026-10-14T03:44:03.550091+00:00. Durable creation-to-last-update window, not browser click-to-response stopwatch.
- Latest diagnostic commit/entered; category null; provider received true; narration parse true.
- Source true; checks 0; receipts 0; final true; narration true.
- Stored source 59358 bytes is not the request size. Claim/context/commit timing, failed attempts, reasoning/cached tokens, request IDs and native causes are unknown.
- No attributable Memory attempt in this log snapshot; this does not establish no call occurred.

### c7503d7e-081d-483c-b764-cde009390f9f

- Creation 2026-10-09T05:01:24.768758+00:00; last update 2026-10-14T03:43:12.474452+00:00. Includes cancellation/owner wait; not execution latency.
- Latest diagnostic plan/failed; category validation; provider received true; narration parse false.
- Source true; checks 0; receipts 0; final false; narration false.
- Stored source 58611 bytes is not the request size. Claim/context/commit timing, failed attempts, reasoning/cached tokens, request IDs and native causes are unknown.
- No attributable Memory attempt in this log snapshot; this does not establish no call occurred.

### 8b4cd405-d654-4fdd-93a0-49518ab608d8

- Creation 2026-10-09T05:00:24.384453+00:00; last update 2026-10-14T03:43:07.899454+00:00. Includes cancellation/owner wait; not execution latency.
- Latest diagnostic plan/failed; category validation; provider received true; narration parse false.
- Source true; checks 0; receipts 0; final false; narration false.
- Stored source 57908 bytes is not the request size. Claim/context/commit timing, failed attempts, reasoning/cached tokens, request IDs and native causes are unknown.
- No attributable Memory attempt in this log snapshot; this does not establish no call occurred.

## Evidence

- recent-turns-safe.json
- next-development-snapshot.log
- P0_LATENCY_EVIDENCE.json (measurements and explicit unknowns)
- private-capture.json read for structural fields only; no hidden prose reproduced.
