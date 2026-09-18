# Development status

Last updated: September 18, 2026. Update before milestone-completion commits and after architectural changes. Never include secrets, credentials or DM-private content.

## Current milestone

**Phase 1 — Persistence**, authorized by the owner. Phase 2 and deployment are not authorized.

## Approved Phase 0 checkpoint

The owner explicitly approved **96b69dcd63d2fa015f5e75bcc5d632c41e04369e**. It remains unchanged in Git as the approved restore point.

- **Original implementation verification:** typecheck, lint, production build and 60 automated tests, plus the implementation browser checks recorded in the historical VERIFICATION.md.
- **Independent review reported by the owner:** typecheck, lint, production build, 41 logic/localization tests, 5 HTTP tests and 14 additional HTML/status route checks passed. Independent visual and image-asset verification was **not performed**. Physical iPhone/Safari remains unverified. These records are distinct.

## Current status

Remote documentation commits through f46014d were safely merged; section 38 remains intact. Our persistence and Chat with DM additions are sections 39 and 40. Only ordered source records and immutable correction-history foundations are added now; no memory runtime is implemented.

Phase 1 code is integrated and locally verified; **Phase 1 acceptance remains blocked by live Supabase setup and verification**. Three workers used separate worktrees and agreed shared contracts before implementation; the lead owns integration. The queued Chat with DM addition joined the campaigns/documents workstream at a safe checkpoint, with an additive migration from the sole database owner.

No configured Supabase instance, environment file, Docker/CLI or PostgreSQL service was found. Real Supabase Auth/REST and signed-in browser persistence verification remain blocked by that prerequisite. Embedded PostgreSQL tests use a clearly labeled test-only auth stub; they do not constitute live Supabase verification. No deployment or real/private campaign import occurred.

## Queued section 38 coordination checkpoint

- **Documentation incorporated:** fetched origin/main and confirmed `d5b2771`, `24443b7` and `f46014d` are ancestors of the integrated branch, merged in `2f85834`. Section 38 matches the remote text verbatim. Its milestone 1–3 requirements and the separate Chat with DM refinement are retained. This follow-up does not restart implementation or duplicate the merge.
- **Foundations implemented and verified:** existing campaign/entity UUIDs and operation request IDs; database-assigned scene/feedback ordering; immutable document/settings versions; revision-checked state corrections; public/private access boundaries; and immutable original/correction receipts linking campaign, operation, source record and resulting revision. Migration 003 was supplied by the existing database/migrations owner and integrated in `04c6c73`. Scene ordering survives corrections, and document restoration appends a version. SQL tests cover tied timestamps, source relationships, retries, original-record preservation and populated-database migration. This is embedded PostgreSQL verification with synthetic auth, not live Supabase verification.
- **Runtime features deferred:** Phase 2 context assembly/token budgeting and live DM behavior; Phase 3 automatic summaries, historical/semantic retrieval and correction-driven derived-memory rebuilding. No embeddings, new memory service or memory UI were added. Section 38's long-campaign, compaction, retrieval-quality and model-quality gates remain future acceptance requirements, not Phase 1 results or additional work.

## Completed work

- Owner-authenticated server APIs, verified cookie sessions, owner-only RLS, separate private schema, campaign-scoped references, bounded same-origin writes and safe public errors.
- Campaigns, independent application/campaign settings, immutable document/settings history, atomic idempotent manual corrections and stale-revision conflicts.
- Generic character/companion/NPC records, storage/items/equipment, sessions/public scenes/resume state, quest/location/asset metadata screens.
- Chat with DM owner messages and reference-only DM Guide reuse the existing save/version/restore infrastructure; no fake replies, automatic guide edits or runtime application.
- Approved Phase 0 demonstrations remain isolated under `/preview`. Persistent screens use actual campaign data without sample fallbacks. Gameplay stays disabled.
- Three migrations include stable public source ordering and immutable private correction receipts. Remote memory requirements remain documented; no summaries, retrieval or memory UI were implemented.
- Setup instructions and opt-in non-destructive two-campaign synthetic verification. START_HERE reflects selectable media providers/models and required owner-access verification before separately approved deployment.

## Files / areas changed

`supabase/`, `src/lib/server/`, `src/lib/persistence/`, owner-only API routes, persistence providers/shell/forms, campaign route integration, English/Russian catalog, isolated preview routing, focused tests, setup/contract/spec/plan/status documentation and dependencies.

## Tests and build status

- Integrated typecheck, lint (no warnings) and production build passed.
- Queued documentation follow-up: reran typecheck, lint, all tests and production build against integrated commit `a3e0060d728fd4c20265fc0045b9e755deae45ef`; all available checks passed, with **121 tests passed, 1 live Supabase test explicitly skipped, 0 failed**. Only this status record changed afterward; no application or migration changes were needed.
- Final development suite after the remote merge: **121 passed, 1 explicitly skipped live Supabase integration test, 0 failed** (122 total).
- Final production verification of integrated code commit `7aec653e43458572230c35fd563fe6993a7c8d8b`: **121 passed, 1 explicitly skipped, 0 failed**. Typecheck, lint and production build also passed on that commit. The following status-only commit records these actual results.
- SQL tests execute all three migrations in embedded PostgreSQL with synthetic auth roles. They cover two unrelated campaigns, durable reopen, owner/non-owner/anonymous access, private markers, immutable document/guide restoration, revision conflicts, retries, inventory integrity, feedback isolation, source order and preserved original/correction payloads. They do not verify Supabase Auth/PostgREST or browser cookies.
- Browser checks covered setup and isolated English/Russian preview navigation, including 320px setup and 390px Russian Game/menu without horizontal overflow. Screenshots of those narrow views were inspected. Signed-in persistence/feedback flows and physical iPhone/Safari remain unverified.
- Production client chunks contain no synthetic private marker, private-schema operation, server auth client or password-sign-in implementation. The setup screen intentionally displays configuration variable names only. No environment files or credentials are tracked.

## Key technical decisions

One Supabase backend; no browser database client, service key, AI or second runtime. Every public read has an explicit projection. Writes use one allow-listed transactional RPC with expected revisions and stable retry IDs; direct table writes are denied. Document restore appends a version; scene settings revisions never change when preferences change. The private schema has no ordinary application reader. PGlite is development-only SQL verification.

Feedback is append-only, campaign-scoped owner text. The DM Guide is a stable linked reference document using the same immutable history, not established canon. Approved guidance is not applied until a separately authorized Phase 2 runtime exists. Future companion/rest/recipe/combat structures remain inert.

## Known issues

Actual Supabase identity, browser cookie lifecycle, refresh/relogin persistence, failed-save browser interactions and signed-in desktop/mobile flows still need the configured local stack. Physical iPhone/Safari is unverified. NPC records are supported, but NPC equipment is unavailable in Phase 1; equipment supports players, companions and appropriate transports/mounts. Asset uploads/media generation and gameplay execution are outside this phase. Preexisting history receives deterministic sequence backfill; unknown old commit order is not reconstructed. No secrets or real campaign material are seeded.

## Remaining work

Configure a disposable local Supabase stack and complete the real Auth/REST and signed-in application checklist before Phase 1 acceptance. No live integration or owner acceptance is claimed. The integrated implementation is committed and pushed; this documentation checkpoint records the confirmed integration and verification boundaries. Stop for owner review. Do not begin Phase 2 or deploy.

## Recommended next step

Follow [SUPABASE_SETUP.md](SUPABASE_SETUP.md): start a local Supabase instance, apply migrations in order and configure one owner, add the listed variable values only to ignored .env.local, then restart the preview. No public signup or deployment.

After setup: sign in → create two unrelated campaigns → save distinct documents/items/settings → refresh and sign out/in. In **Chat with DM / Чат с DM**, save a message and refresh; manually save two DM Guide versions and restore the older one as a new version. Confirm sending chat leaves guidance and all gameplay records unchanged. Try a failed save and two-tab conflicting edit; drafts must remain. See the setup guide for direct access and mobile checks.

The approved visual preview remains at **http://127.0.0.1:3000/preview/campaigns/long-road-west/game**. The persistent application starts at **http://127.0.0.1:3000/** and honestly displays setup instructions until configured.

---

## Historical remote documentation handoff — September 18, 2026

The owner reports having sent Phase 0 approval and the Phase 1 multi-agent implementation prompt to the local development Codex. The implementation status below records the last published Phase 0 checkpoint, not a verification of the local Phase 1 work. Do not interpret its historical approval-pending/stop statements as revoking the owner's subsequent authorization.

Added MASTER_SPEC section 38 and aligned DEVELOPMENT_PLAN milestones 1–3: exact state versus derived memory, source/visibility/revision tracking, model-specific context budgets, bounded retrieval, validated summary/checkpoint lifecycle, corrections/invalidation, idempotent turn/resume behavior, failure recovery and measurable synthetic acceptance gates. These are requirements, not implemented features or guarantees of perfect recall.

This update changes documentation only; no application code, migrations, dependencies, runtime, credentials or campaign data were changed. Tests/typecheck/lint/build were not rerun for this update. Earlier verification results below remain historical.

For the active lead integrator: fetch and safely merge these remote documentation changes at the next safe checkpoint; preserve local work, including the separately requested Chat with DM refinement. Coordinate overlapping documentation edits. Continue authorized Phase 1; incorporate only its memory foundations now. Phase 2/3 runtime work remains deferred until separately authorized.

---
