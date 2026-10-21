# Adventure / Media V1 — live FRAME gate stopped

September 28, 2026. Tested production implementation: `e03d6c8c2fe12e459e8947a234a06c36fa1042dd` on `codex/v1-adventure-media`. **The bounded FRAME gate failed materially at F2. VIDEO remains unstarted. The combined milestone is not owner accepted.** Adventure/loot/reward/container direction remains accepted for completing this wave; none of that implementation is restarted or redesigned.

## Outcome and required stop

F2's archway reveals a recognizable distant fortified settlement/castle-like skyline absent from the approved public scene and location reference. This is more than incidental surface detail and fails the required location grounding. The lead and the existing independent FRAME reviewer agree the gate must stop. It is a generated-output grounding defect, not evidence that the provider received DM-private state or that art changed gameplay Canon.

F2 also depicts Ari seated on the bench rather than simply pausing beside it. The face appears younger/smoother than F1; angle, expression and lighting prevent a definitive identity-failure claim from these two views. Shared dark hair, charcoal coat, cream shirt and brown boots broadly persist, but recurring face consistency is **not established**. F1's exact button count/eyebrow notch and compass-grip details are limited. These issues are recorded rather than repaired through a paid retry.

## Capability, budget and dispatch basis

The owner-selected exact model was `gpt-image-2.5-sunburst-2026-09-08`, high quality, 1536×1024, one nonstreaming PNG per direct Images request. Current dated capability and rates were rechecked in the [official model page](https://developers.openai.com/api/docs/models/gpt-image-2.5-sunburst), [image guide/calculator](https://developers.openai.com/api/docs/guides/image-generation#cost-and-latency) and [pricing](https://developers.openai.com/api/docs/pricing). The 2.5 calculator was explicitly set to high, 1536×1024: 1,372 output tokens × $30/M = $0.04116 output component. Direct text input is $5/M, image input $8/M; no cached discount was assumed.

The existing 60,000-byte text ceiling contributes at most $0.30 under its byte accounting bound. The existing **$0.40/request reservation** remains conservative. The full five-image plan would reserve $2 within the **same $20 combined FRAME+VIDEO ceiling**. A service-role-only synthetic budget was provisioned at $20 with a five-FRAME-attempt ceiling before dispatch; two claims now retain $0.80. No refund, extra attempt or zero-cost assumption is inferred from unknown account billing.

The OpenAI server credential was checked for presence and used only by the existing server provider; it was never exposed to source, logs or browser code. FAL_KEY remains absent. No hosted database credentials were used. The production implementation SHA and clean checkout were revalidated at each actual provider dispatch. Prompt digest, explicit model, size, quality, count and redirected-request rejection were enforced.

The five public cases/references are unchanged from [gate preparation](ADVENTURE_MEDIA_FRAME_GATE_PREPARATION.md). They use approved **textual** visual references; pixel references remain fail-closed. The normal Visual Bible draft → explicit approval path created immutable reference versions. Production `buildRealFrame` and `executeMediaFrame` performed reviewed queue → service claim/reservation → the existing OpenAI image requester → checked PNG → atomic SQL completion/asset attachment. Authority used real disposable PGlite migrations 1–26; immutable pixels used an isolated scoped local store. This does **not** claim hosted Supabase Storage/Auth behavior.

## Five-case record

| Case | Result | Input/output tokens | HTTP latency* | Usage-calculated charge | Reserved |
| --- | --- | --- | --- | --- | --- |
| F1 — Bridge daylight | Returned, validated, attached; bounded first-image review passed with fine-detail limits | 379 / 1,372 | 45.675s | $0.043055 | $0.40 |
| F2 — Courtyard profile | Returned, validated, attached; **material grounding failure** | 331 / 1,372 | 29.584s | $0.042815 | $0.40 |
| F3 — Rain shelter | NOT ATTEMPTED — required material-gate stop | — | — | — | $0 |
| F4 — Table detail | NOT ATTEMPTED — required material-gate stop | — | — | — | $0 |
| F5 — Outfit A → B | NOT ATTEMPTED — required material-gate stop; outfit change unverified | — | — | — | $0 |

*Elapsed request dispatch to received HTTP headers, not complete SQL/storage/UI duration. Both responses were HTTP 200. Each omitted actual model identity; it is honestly unavailable, not fabricated from the requested name. Exact configured/requested dated model is recorded, and the normal requester rejects a conflicting returned model if supplied.

Total: **2 network attempts, 2 successful transport/validated attachments, no retry or fallback.** Returned usage: 710 text-input, zero image-input, 2,744 image-output, 3,454 total tokens. The sum calculated from returned usage and official rates is **$0.085870**. Provider-account charge was not independently observed. **$0.80 remains reserved. VIDEO requests/reservations/cost: zero. Combined media usage-calculated charge: $0.085870; combined retained reservation: $0.80; authorized ceiling: $20.**

## Exact synthetic attachments and evidence

Campaign: `ba1dadcc-1a0b-4661-b3d7-280babb2f1bf`; service budget: `4304da7c-9f0b-426c-9c0a-e20f14821082`. Public synthetic identity values below are operational provenance, never real/private campaign information.

| Case | Scene | Job/asset | Dispatch receipt |
| --- | --- | --- | --- |
| F1 | `abea2afd-0613-4e5b-bad1-41436eb5340f`, revision 1 | `f8c90b9b-3297-454b-9e56-eea678054370` | `2a63baba-61a8-408f-9a1c-15943a76dedf` |
| F2 | `72b72c45-4e46-44f0-8e50-ca69d65e7601`, revision 1 | `fcee61a9-d35d-4c69-9c92-28f17092abc0` | `9df388fb-f596-4f91-b948-346157e38458` |

[Immutable original response, request/scene/reference versions, usage, hashes and receipts](C:/Users/<owner>/.codex/visualizations/2026/09/20/01a0bdc4-4046-70f0-8b15-9c7d87f43b29/frame-live-gate-20260928-run1/journal.json) and [bounded assessment](C:/Users/<owner>/.codex/visualizations/2026/09/20/01a0bdc4-4046-70f0-8b15-9c7d87f43b29/frame-live-gate-20260928-run1/ASSESSMENT.json) retain the full public synthetic basis. Fixture digest: `34c7d4c008a490120fc441b5996ec111afa8578058a1abb0b934fa342b8e02ce`. F1 uses approved Ari/outfit A + style + current bridge + equipped compass. F2 uses the identical Ari/style versions + current courtyard and deliberately excludes the compass reference. F1 image hash: `56d4976d7ffb0f794fd35f4e33e7bdb83019c1249dd16891711c1c5cb8d31576`; F2: `969a8363702517ebd22df29092411d28907fb53fe3b912a609fc097b5c748605`. Original raw JSON responses are retained separately without any credential. The first process-only preparation ended on input closure with zero provider attempts; its separate synthetic dump/journal was retained and no paid result was reused.

### F1 — first image

![F1 — Bridge daylight](C:/Users/<owner>/.codex/visualizations/2026/09/20/01a0bdc4-4046-70f0-8b15-9c7d87f43b29/frame-live-gate-20260928-run1/ba1dadcc-1a0b-4661-b3d7-280babb2f1bf/frames/f8c90b9b-3297-454b-9e56-eea678054370/output.png)

### F2 — failed grounding

![F2 — unestablished distant settlement beyond the courtyard archway](C:/Users/<owner>/.codex/visualizations/2026/09/20/01a0bdc4-4046-70f0-8b15-9c7d87f43b29/frame-live-gate-20260928-run1/ba1dadcc-1a0b-4661-b3d7-280babb2f1bf/frames/fcee61a9-d35d-4c69-9c92-28f17092abc0/output.png)

## Authority and verification

Exact command receipt replay after both attachments created **zero additional paid calls or assets**. Prior F1 art remains present/hash-identical after F2. Per-case before/after digests prove FRAME lifecycle leaves synthetic public/character/inventory/resource, runtime/time, timeline/head/Canon, private and World Event state unchanged. Separate explicit synthetic scene setup/reference approval remains factual setup; it is not incorrectly counted as media lifecycle. A private/future synthetic canary is absent from positively constructed provider briefs.

Fresh affected offline preflight: **113 tests passed, zero failed/skipped** on the frozen e03d6c8 implementation, including real SQL lease/Canon/Lab checkpoint preservation, ordinary factual-reference invalidation, privacy, idempotency, cancellation, uncertain/stored-result recovery, no second paid dispatch, malformed PNG and previous-result preservation. The [prior integrated verification](ADVENTURE_MEDIA_V1_VERIFICATION.md) remains historical: 1,523 total / 1,522 passed / one opt-in hosted test skipped, plus type generation, nonincremental typecheck, zero-warning lint and webpack build. Those are not rerun or mislabelled fresh after documentation-only live evidence.

No production code, prompts, UI, fixtures, schema or migration changed during this gate. No real database migration, campaign import, deployment, Adventure playtest or DM quality call occurred. Existing frozen Mega DM evidence and the original dirty checkout remain unchanged. Ordinary-flow EN/RU desktop/mobile evidence remains the previously recorded 24 combinations; it is not a new browser run or physical-iPhone claim. The synthetic component preview still runs at [local review](http://127.0.0.1:3102/preview/adventure-media) and displays scripted schematic art; inspect the live outputs above or in the separate local review artifact.

## Remaining gate and stop

This finite two-image sample cannot establish recurring face identity, outfit B correctness, all lighting/viewpoints or pixel-reference fidelity. No secret object/private fact appeared in model input; no hidden-state disclosure is established by an invented generic skyline. Art remains presentation only and creates no gameplay fact.

**VIDEO is not implemented or dispatched.** The preferred Seedance candidate, its current billing/schema and two-sample path are not silently substituted or begun after a failed FRAME gate. FAL_KEY would need server-side setup only after this gate is legitimately cleared; no secret is requested here. A corrected FRAME/reference-grounding approach requires a separately reviewed bounded continuation. Main remains `1f9e3c56896d9cd5a374af6857f918c46bb80603`. Stop for owner review, with no actual Level 1 Fighter Adventure or future lane.
