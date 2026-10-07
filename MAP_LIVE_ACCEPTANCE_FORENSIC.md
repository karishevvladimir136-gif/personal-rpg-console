# Map live-acceptance forensic closure

**Status:** Map media lifecycle accepted in the isolated synthetic review campaign. The old uncertain provider outcome remains indeterminate. This is not owner campaign activation or acceptance of multi-place cartographic quality.

## Boundary and evidence

- Starting branch/head: `codex/character-sheet-polish` at `50ed75691947d975abf53f6b7e8600b705b0df15`.
- Main remained `4d4de0b0cc16ff21f84c24b63df7cbd5290f81df`. The real owner database stayed at Migration 41; Migration 42 was not applied there. The owner campaign, gameplay, app on port 3000, and deployment were untouched.
- All media changes below belong to the disposable synthetic campaign `6a02d590-044d-465e-8dba-bf7a72fc5900` through the candidate app on port 3001.
- The old saved Map job is `c85787c3-fad4-4e8d-b3c5-aaf39251cd73`. Its queued version was saved at 2026-10-07 08:31:47.957714 UTC, generating/claimed version at 08:31:48.575263, and terminal `uncertain` version at 08:32:39.399413. The claim used server dispatch ID `7d91f027-ac5c-4826-985e-f5bee9791e2e` and one immutable $0.60 reservation: $0.40 image plus $0.20 automated review.

## Old uncertain dispatch: stage reconstruction

| Stage | Status | Evidence |
| --- | --- | --- |
| Reservation | confirmed success | One immutable media-budget reservation and claim receipt belong to the old job and dispatch ID. |
| Claim | confirmed success | The saved job advanced from queued to generating. |
| OpenAI request | unknown | Application code invoked the OpenAI image adapter after claim, but saved evidence cannot prove delivery to OpenAI. |
| Provider response | unknown | No OpenAI HTTP status, provider request ID, response metadata, or exact transport error was persisted. |
| PNG parse | unknown | A malformed/oversized/invalid response and a transport/provider failure collapse into the same safe error; no parsed output was saved. |
| Storage | not reached | The catch boundary preceded `store.put`; no object exists at the job's exact `output.png` path or in the inspected storage volume/window. |
| Automated review | not reached | No `media_frame_checks` row belongs to the job. |
| Draft | not reached | No draft version or review result was saved. |
| Acceptance | not reached | No completed version or Asset belongs to the old job. |

The Next request trace lasted about 60 seconds and ended with application HTTP 503. This is **not** evidence of an OpenAI 503 or a provider charge. The adapter timeout is 120 seconds, so elapsed time does not prove that timeout either. Static prompt/parameter/reservation prechecks passed, and the same image adapter had produced earlier synthetic portrait, item, and FRAME outputs. The cause of the old provider uncertainty remains genuinely indeterminate.

## Narrow recovery correction

The live Map UI offered a new `retryOf` proposal for an uncertain job, but both TypeScript and Migration-41 SQL reject a new same-basis job while that old job remains `uncertain`. The existing lifecycle already permits `uncertain → cancelled` without a new provider call and preserves immutable versions and the original reservation. A compact Map-only **Close uncertain request** control now makes that terminal transition explicit. It warns that the old outcome/charge is unknown, closure ends that job's recovery, and a replacement needs separate paid confirmation. It never automatically closes or redispatches the old request. No SQL, migration, provider adapter, gameplay, or geography authority changed.

The old synthetic job was explicitly closed at 2026-10-07 17:10:45.493995 UTC as revision 4. Its queued, generating, and uncertain versions remain intact. Its old dispatch and $0.60 reservation remain unchanged. A disposable SQL regression proves duplicate rejection while uncertain, explicit closure, preservation of versions/reservation, a distinct queued `retryOf` job, and a distinct fresh claim/reservation.

## One fresh controlled Map request

The normal UI prepared a new request with `retryOf` pointing to the closed old job and displayed a **$0.60 reservation ceiling**. Exactly one fresh image request was explicitly confirmed. The new job was `fbf1989a-2b4c-4812-b95c-fe326237e426`, with distinct server dispatch ID `8010d1bc-f182-4453-ae42-6d5bed6236d2`.

| Stage | Result |
| --- | --- |
| Prepare and paid confirmation | Fresh job and separate owner confirmation; no old dispatch identity reused. |
| Claim | One new immutable $0.60 reservation; media budget moved from 10 reservations/$6.00 reserved to 11/$6.60 of a $20 ceiling (30-call maximum). These are ceilings, not verified billing. |
| OpenAI pixels | One image-generation request returned provider request ID `req_66b3addb275345f0835ff3194337fb9d` and a PNG. Stored output usage reported 287 text-input, 0 image-input, and 1,372 output tokens. |
| Storage | Exact `rpg-media` path for the new job contains a 3,065,611-byte PNG, SHA-256 `af58a0f24aafef2455ba2a82cb8aa64854c435405625fe3fb9a7589092645624`. |
| Automated review | One completed `gpt-5.4-2026-03-05` check returned `review_warning` for possibly legible tiny papers/symbols. Original-resolution visual inspection found no clearly readable label. |
| Draft | A private reviewable draft was saved; it was not ordinary Map art before Keep. |
| Acceptance | The explicit **Keep image** action saved completed version 4, acceptance receipt `331c114f-6bda-4da9-b9fa-02d768555f22`, and one accepted image Asset. The candidate Map displayed it underneath the structured current-place pin. |

The one-place synthetic World view has a provisional pin. Its existing prompt intentionally depicts only that public meeting place and avoids inventing surrounding regions or routes. The result is a scenic meeting-house illustration, so this run proves the live Map artwork pipeline and pin overlay, **not** multi-pin cartographic accuracy. Pixels establish no Location, route, or gameplay fact; the structured pin and public Location remain authoritative.

One new image-generation provider call and one automated review provider call occurred in this closure. No additional image generation, retry, or gameplay-model call occurred. Actual billed spend is not established from reservations.

## Verification and artifacts

- Focused Map/media regression batch: **77/77 passed**, including the new disposable SQL recovery test. The final expanded SQL recovery test passed **6/6** on its own. TypeScript, zero-warning ESLint, and production webpack build passed.
- The synthetic campaign's entity, item, public-state, Location, and encounter row fingerprints were identical before and after the fresh media lifecycle. The owner campaign was never used.
- Browser evidence: `C:\Users\karis\.codex\artifacts\map-live-closure-20261007\map-draft-review.png`, `map-pixels-reviewed.png`, and `map-accepted-under-pin.png`. A read-only copy of the exact stored PNG is at `C:\Users\karis\.codex\artifacts\map-forensic-20261007\map-draft.png`.
- No main merge, owner database migration, owner gameplay action, or deployment occurred.

**Result: MAP LIVE ACCEPTED** for the bounded one-place live media lifecycle. Any future multi-place map-art quality review is separate.
