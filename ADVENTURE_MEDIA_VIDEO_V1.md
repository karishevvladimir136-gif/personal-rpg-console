# Current VIDEO V1 live verification — one original clip available

The bounded synthetic live smoke now succeeded on unchanged `69b5b0b0975d40864e653d5d511c7d67f00a590c`. An existing ignored `C:/Dev/personal-rpg-console-phase38-preparation/.env.local` FAL_KEY was safely loaded into server smoke process memory only; it was not copied into this checkout, tracked source or browser. No new secret setup was required for the sample. The ordinary credential-free preview remains scripted; normal production server setup below is still required for a separately authorized real environment.

Exact fal `bytedance/seedance-2.5/us/image-to-video` request:720p,10s,audio enabled,auto aspect,H264/standard bitrate. One generation reached Ready and attached with actual SQL authority, exact accepted F5 provenance and local scoped storage. Original1178×786/10.04-second H264/AAC video fully decodes and plays. Refresh/replay/reload does not generate another clip. No second sample, automatic retry, gameplay/Canon mutation or hosted Supabase claim.

Current official schema/pricing was freshly checked immediately before paid dispatch. fal omitted actual model identity, returned usage and invoice charge. Decoded dimensions/duration at the documented US rate estimate **$5.59602881**; combined historical media estimate **$6.10163631**. The one $7 VIDEO reservation plus $4.40 history retains **$11.40** of the same $20 ceiling. Optional second is NOT ATTEMPTED/unclaimed. [Live report/source/output](ADVENTURE_MEDIA_VIDEO_LIVE_SMOKE_REPORT.md), [owner clip review](http://127.0.0.1:3103/review), [fresh final verification](ADVENTURE_MEDIA_V1_VERIFICATION.md).

No implementation/configuration/migration changed for this successful sample. Production use, long-run provider reliability and artistic quality remain separately qualified. The previous then-current setup/verification body follows verbatim; its prior zero-attempt/absent-key statement is historical, superseded only by this current live evidence.

---

> Historical record below: preserved verbatim from the pre-VIDEO-smoke candidate. Then-current limitations are not rewritten.

# VIDEO V1 — implementation, setup and limits

VIDEO is optional scene presentation, explicitly triggered from an **owner-accepted current-scene FRAME**. Unreviewed/discarded/hard-rejected drafts and historical pre-approval image metadata cannot start VIDEO. No hidden paid keyframe is generated. Server SQL checks the actual private FRAME check and acceptance receipt, not just a client prefix. Its exact source image/version/hash, scene/public revision, approved reference versions, Canon generation, head and timeline remain pinned.

## Supported bounded path

Provider: fal, exact model `bytedance/seedance-2.5/us/image-to-video`; 720p, 10 seconds, audio on, standard bitrate, H264. The provider's image-to-video schema requires `aspect_ratio=auto`; this is retained rather than assuming a forced 16:9. The source is restricted to a current accepted 1536×1024 PNG. The prompt uses committed public scene/approved guidance only. Animation is presentation, never new actions, objects, knowledge, damage or gameplay facts.

Explicit Generate queues one job and conservatively reserves **$7** in the existing service-only media budget before one queue POST. `X-Fal-No-Retry: 1` disables provider queue retries; no local automatic generation retry or fallback exists. Subsequent Check status reads the same private provider request ID. Pending generation does not hold a gameplay request open. Ready MP4 bytes enter immutable private `rpg-media` storage and attach atomically as an ordinary Asset + Document version/receipt. Gallery signs only owner/campaign-authorized completed media; raw provider URLs/IDs and credentials never become normal public client diagnostics.

Cancel video attachment preserves history and prior usable clips; it prevents a late result attaching. It does **not** promise provider cancellation/refund. Regeneration is a separate explicit new paid job/reservation, never an automatic aesthetic retry. If submission is accepted but its response/ID is lost, status stays unknown and its reservation is retained: no replacement is silently created. If the ID or completion was durably recorded, refresh/retry reads that same job or stored bytes without another generation.

## Capability/pricing check

Verified current [US model schema](https://fal.ai/models/bytedance/seedance-2.5/us/image-to-video/api), [US model pricing](https://fal.ai/models/bytedance/seedance-2.5/us/image-to-video), [queue documentation](https://fal.ai/docs/documentation/model-apis/inference/queue), and official fal queue-client same-ID path normalization. US endpoint rate is $0.02568 per 1,000 video tokens; token calculation is height × width × seconds × 24 / 1024. Do not substitute the different non-US endpoint rate. Both audio modes have the documented same price. The $7 reservation is conservative for this fixed source/720p/10s path; **it is not observed provider charge**. Current capability/pricing must be revalidated before any future paid smoke.

At most two clips can consume $14 additional reserve. Historical + new FRAME/QA retained reserve is $4.40, so the planned complete envelope is $18.40 ≤ $20. Actual VIDEO attempts, returned usage and calculated/observed charge are **0**: `FAL_KEY` is absent. No paid VIDEO smoke, generated clip, audio/visual quality or hosted fal/Supabase behavior is claimed.

## Server setup for a separately authorized real use

No setup or real database migration is needed to inspect the synthetic preview. A later real environment needs:

- the existing owner authorization, Supabase server service configuration and private `rpg-media` bucket;
- additive migrations through 29 applied only under separate real-database authorization;
- `FAL_KEY` stored as a **server secret**, never Campaign data, browser code or chat;
- `RPG_VIDEO_ENABLED=true` and `RPG_VIDEO_MODEL=bytedance/seedance-2.5/us/image-to-video`;
- `RPG_MEDIA_BUDGET_ID` pointing to the existing bounded owner service budget, with historical reservations retained;
- service-only `rpg_media_video_enable(owner_id, budget_id)` enabling at most two video calls on that same budget, without resetting limit/reservations.

No automatic startup call runs this setup or a provider. With missing/mismatched configuration, the ordinary VIDEO surface honestly stays unavailable; no default paid model is selected. FRAME and VIDEO have separate call quotas but one shared dollar-reservation ceiling. UI price disclosure is a reservation, not a guaranteed final invoice.

## Verification scope

Focused fake-provider tests cover one POST, exact parameters/source, pending reads, same-ID result/download, no credentials on CDN requests, strict allowed URLs/no redirects, malformed container rejection, no retry/fallback, missing configuration and safe errors. Independent disposable SQL verifies true FRAME approval/provenance, authorization, atomic completion, cancellation/failure, concurrent dispatch, stale callbacks, budget rollback, source corrections, exact replay, old saves and populated upgrades. MP4 validation checks bounded container structure/hash; it does not prove codec decodability, animation correctness or audio quality.

The ordinary Game and Gallery components expose Generate, Check status, cancellation, result/history and playback, EN/RU and responsive. The preview's explicitly enabled scripted VIDEO demonstrates lifecycle only and truthfully has no generated playable clip. Final combined repository/browser results are recorded in [verification](ADVENTURE_MEDIA_V1_VERIFICATION.md); independent findings are in [VIDEO QA](ADVENTURE_MEDIA_VIDEO_QA.md). The real Level 1 Fighter Adventure has not started. Stop for owner review; keep main unchanged.
