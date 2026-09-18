# Development status

Last updated: September 17, 2026. Update before milestone-completion commits and after architectural changes. Never include secrets, credentials or DM-private content.

## Current milestone

**Phase 1 — Persistence**, authorized by the owner. Phase 2 and deployment are not authorized.

## Approved Phase 0 checkpoint

The owner explicitly approved **96b69dcd63d2fa015f5e75bcc5d632c41e04369e**. It remains unchanged in Git as the approved restore point.

- **Original implementation verification:** typecheck, lint, production build and 60 automated tests, plus the implementation browser checks recorded in the historical VERIFICATION.md.
- **Independent review reported by the owner:** typecheck, lint, production build, 41 logic/localization tests, 5 HTTP tests and 14 additional HTML/status route checks passed. Independent visual and image-asset verification was **not performed**. Physical iPhone/Safari remains unverified. These records are distinct.

## Current status

Phase 1 code integration and verification are in progress. Three workers used separate worktrees and agreed shared contracts before implementation; the lead owns integration. The queued Chat with DM addition joined the campaigns/documents workstream at a safe checkpoint, with an additive migration from the sole database owner.

No configured Supabase instance, environment file, Docker/CLI or PostgreSQL service was found. Real Supabase Auth/REST and signed-in browser persistence verification remain blocked by that prerequisite. Embedded PostgreSQL tests use a clearly labeled test-only auth stub; they do not constitute live Supabase verification. No deployment or real/private campaign import occurred.

## Completed work

- Owner-authenticated server APIs, verified cookie sessions, owner-only RLS, separate private schema, campaign-scoped references, bounded same-origin writes and safe public errors.
- Campaigns, independent application/campaign settings, immutable document/settings history, atomic idempotent manual corrections and stale-revision conflicts.
- Generic character/companion/NPC records, storage/items/equipment, sessions/public scenes/resume state, quest/location/asset metadata screens.
- Chat with DM owner messages and reference-only DM Guide reuse the existing save/version/restore infrastructure; no fake replies, automatic guide edits or runtime application.
- Approved Phase 0 demonstrations remain isolated under `/preview`. Persistent screens use actual campaign data without sample fallbacks. Gameplay stays disabled.
- Setup instructions and opt-in non-destructive two-campaign synthetic verification. START_HERE reflects selectable media providers/models and required owner-access verification before separately approved deployment.

## Files / areas changed

`supabase/`, `src/lib/server/`, `src/lib/persistence/`, owner-only API routes, persistence providers/shell/forms, campaign route integration, English/Russian catalog, isolated preview routing, focused tests, setup/contract/spec/plan/status documentation and dependencies.

## Tests and build status

Integrated typecheck, lint and production build passed. Development and production suites each passed 120 tests, with one explicitly skipped live Supabase integration test. A final verification will follow the late remote memory-foundation merge. Browser checks covered setup and isolated English/Russian preview navigation, including 320px setup and 390px Russian Game/menu without horizontal overflow. No live Supabase or signed-in browser result is claimed.

## Key technical decisions

One Supabase backend; no browser database client, service key, AI or second runtime. Every public read has an explicit projection. Writes use one allow-listed transactional RPC with expected revisions and stable retry IDs; direct table writes are denied. Document restore appends a version; scene settings revisions never change when preferences change. The private schema has no ordinary application reader. PGlite is development-only SQL verification.

Feedback is append-only, campaign-scoped owner text. The DM Guide is a stable linked reference document using the same immutable history, not established canon. Approved guidance is not applied until a separately authorized Phase 2 runtime exists. Future companion/rest/recipe/combat structures remain inert.

## Known issues

Actual Supabase identity, browser cookie lifecycle, refresh/relogin persistence and signed-in mobile flows still need the configured local stack. Physical iPhone/Safari is unverified. Asset uploads/media generation and gameplay execution are outside Phase 1. No secrets or real campaign material are seeded.

## Remaining work

Finish integrated checks and independent source review, record results, commit and push focused Phase 1 changes. Configure a disposable local Supabase stack and complete the live checklist before Phase 1 acceptance. Stop for owner review; do not begin Phase 2 or deploy.

## Recommended next step

Follow `SUPABASE_SETUP.md` for the smallest local setup checklist. The approved visual preview remains at **http://127.0.0.1:3000/preview/campaigns/long-road-west/game**. The persistent application starts at **http://127.0.0.1:3000/** and honestly displays setup instructions until configured.
