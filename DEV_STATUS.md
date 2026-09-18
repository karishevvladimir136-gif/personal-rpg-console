# Development status

Last updated: September 18, 2026. Update before milestone-completion commits and after architectural changes. Never include secrets, credentials or DM-private content.

## Current milestone

**Phase 2 — Text DM: implementation integrated; live OpenAI acceptance blocked on secure local owner setup. NOT READY FOR OWNER ACCEPTANCE yet.** Phase 1 remains owner-approved at `a0c7a815b413251df45a961af8c77986975e546f`, recorded in `1a4fee6cc7e3827a51749e23fe1b00a7eee78b1a`. Phase 3, deployment and real campaign/DM-private imports are not authorized.

## Phase 2 current status and completed work

- **Narrow Astra configuration update (September 18):** verified the [official Astra model page](https://developers.openai.com/api/docs/models/gpt-6-astra) and [Responses migration guidance](https://developers.openai.com/api/docs/guides/latest-model) before editing. Added explicit `gpt-6-astra` support and server-only `OPENAI_DM_REASONING`, with application default `xhigh` for Astra. All three provider stages send validated `reasoning.effort`; unsupported combinations fail before transport. Safe actual-model diagnostics and usage reporting recognize Astra aliases/dated response names. The 1,050,000-token model window retains the existing operational cap, total output/reasoning reserve, strict schemas and privacy boundaries. The 5.4 models remain explicit alternatives, with no automatic fallback. No environment files, UI, migrations or gameplay scope changed; no live OpenAI calls were made.
- All three development workers acknowledged `PHASE2_CONTRACTS.md` and the concrete DTOs at `c7c46e6` before GO. Each used a separate worktree/branch; the lead integrated runtime/database, mechanics and UI in that order, including follow-up fixes. Workers did not push. Only the database worker changed `supabase/**`.
- Owner-authorized APIs connect persistent Game, OOC, companion conversations and separate Chat with DM to one server-side DM runtime. Strict planning/output schemas, a public-only narration stage, allow-listed errors and serialization separate private planning from browser responses. No fake production DM replies.
- Accepted input, operation/check IDs, statuses, fenced leases, saved plans/results and transactional consequences survive failure/retry. Duplicate operations return their existing result; stale manual/settings/document changes reject the old proposal. Dice use server randomness; interactive playback never rolls again. Rerolls require explicit commands and campaign allowance.
- The explicit `console-basic-v1` house profile enforces supported checks/combat budgets, independent enemy HP/damage scaling, defeat policies, inventory/resources, quests/locations, camp/rest supplies and recovery, remote storage/cargo access, meal/coffee preparation and consumption, effects and a component-aware spear transformation. Unsupported mechanics fail closed. Manual correction tools and the isolated Phase 0 preview remain available.
- Feedback may propose guidance but cannot apply it automatically. Explicit session approval and immutable campaign-guide versions reuse existing document infrastructure, with revision checks and retry receipts. A changed guide invalidates an older proposal's baseline. Session guidance expires with its session; ordinary gameplay receives approved guidance rather than the feedback thread.
- Existing EN/RU design and responsive layout are retained. Input drafts are campaign/mode scoped; accepted input/status is durable. FRAME/VIDEO remain inactive. No Phase 3 runtime, deployment or real campaign/private import occurred.

## Phase 2 files / areas changed

`PHASE2_CONTRACTS.md`; shared DTOs, context/provider/store/schema and mechanics/turn modules in `src/lib/gameplay/`; server-only `src/lib/server/dm/` and gameplay service; campaign-scoped play/turn/resume/guidance routes; additive migration `202609180004_phase2_runtime.sql`; Game/Chat/Camp/actions/configuration UI and existing Party/Inventory/Settings integration; `gameplay.css`; English/Russian strings; focused and integrated tests; synthetic acceptance scripts; `PHASE2_SETUP.md`, `SUPABASE_SETUP.md`, `START_HERE.md`, specification, plan and this status file. Local environment, logs, fixtures, credentials and backup files remain ignored.

## Phase 2 tests and build status

### Automated local verification

- Final Next route type generation, TypeScript check, full ESLint and normal Turbopack production build **passed** after integration and browser fixes. No lint warnings.
- Full suite after the Astra update: **213 total, 212 passed, 1 explicitly skipped, 0 failed**. Typecheck, full lint and production build passed again. The skipped test is the opt-in Phase 1 empty-database seed/integration test; it passed at the accepted Phase 1 checkpoint and must not be reseeded over the now-populated fixtures. Real Supabase checks from the integrated checkpoint are recorded separately below.
- Astra-focused provider/context checks: **21 passed** using synthetic Responses and no provider network calls. Cover all provider stages, default/explicit effort, supported alternatives, invalid configuration/readiness with zero transport attempts, safe actual-model reporting, server environment wiring, strict output and bounded/private context behavior.
- Tests cover strict output/public-private patch rejection, owner/campaign boundaries, concurrent operation serialization, lease takeover, duplicate/reconnect/retry, recorded dice and explicit rerolls, stale manual/settings changes, hidden/DC filtering, required versus discretionary checks, atomic inventory/resources, encounters, rest/camp/storage, effects/transformation provenance, guidance approval/scope/version conflicts, bounded context/oversize and draft/localization behavior.
- Integrated tests exercise the production turn engine and RPC adapter against all four committed migrations in embedded PostgreSQL, with explicitly synthetic Auth and scripted provider outputs. They verify accepted-input durability, failed narration/retry with the same dice, atomic rejection, feedback isolation/explicit guide versions and supported mechanics. They are not real OpenAI tests.
- A **26-operation deterministic mechanics journey** passes with state serialized/reloaded between actions. It is a domain-level scenario, not the required live 20–30 turn model campaign.

### Real disposable local Supabase / application verification

These live-database and browser results belong to the integrated checkpoint `8178509`; they were not repeated for the subsequent configuration-only Astra change.

- Preserved the populated Phase 1 database and two accounts/one authorized owner. Created and verified a local database backup, then applied only additive migration **004**; no reset or destructive reseed. Auth/Postgres/REST remain local, with Docker ports verified on loopback. The new service credential was configured directly in ignored local environment without displaying it.
- `scripts/gameplay-app-acceptance.mjs`: **all 8 groups passed** against the running development application and real local Auth/database. New unrelated **Synthetic Phase 2 · Glass Orchard** and **Synthetic Phase 2 · Quiet Comet** campaigns leave the original Phase 1 campaigns intact. Checks include owner/non-owner/anonymous/origin restrictions, persisted item/resource use, duplicate/concurrent operation protection, stale manual correction, campaign isolation, rest/recipe/effect state and consumed-source preservation, quest/location consequences, logout/relogin. These checks make no OpenAI calls.
- `scripts/gameplay-access-acceptance.mjs`: passed against the **production application on port 3001**. Real PostgREST denies anonymous, ordinary owner and non-owner direct access to the service-only runtime RPC/private schema. **17** normal owner campaign/play/turn responses contained no synthetic private canary, operational checkpoint or server credential. All **20** production client JavaScript files contained no private canary or server credential names/values. Only synthetic private markers were used.
- The temporary production verification server was stopped. The development preview remains on **http://127.0.0.1:3000/campaigns** with local Supabase running.

### Browser verification actually performed

- Inspected the desktop Game and 390px/320px layouts, including Russian Game, campaign rules configuration, Camp, companion dialog and language settings. No horizontal page overflow in the checked narrow layouts; the existing dark/bronze visual direction remains intact. Saved Russian for checks, then restored the owner's English preference.
- Submitted a synthetic Game action with OpenAI unconfigured: the configuration failure retained the accepted action and exact draft across navigation/refresh. Retry reused the same accepted action; cancelling released it while retaining editable input. No fabricated narration or rolls appeared.
- Submitted separate synthetic DM feedback; its configuration failure preserved the message and left the DM Guide unchanged. No fake reply or unapproved guidance was presented. The other campaign showed no feedback or game input from the first.
- Started a long rest in Quiet Comet from the Russian mobile UI: opening camp did not heal. Explicitly allocated one supply and completed the rest. Returning to Game showed saved recovery from 6/12 to 12/12; camp closed. The separate real HTTP checks verify the corresponding atomic supply/time/effect rules.
- Opened the companion conversation and explicit-listener UI. A live companion reply, actual interactive-dice animation after a model-requested roll and live feedback proposal/approval are **not** claimed as browser-verified while OpenAI remains unconfigured.

### Live OpenAI verification: blocked, not passed

`OPENAI_API_KEY` and `OPENAI_DM_MODEL` are absent from ignored local configuration. **Actual model used: none. Live provider calls: 0. Provider token usage/cost: none.** Observed browser failures were deliberate missing-configuration failures, not provider responses. Deterministic provider failure/retry tests are separate from live API reliability. No large paid evaluation was run.

The required synthetic **20–30 turn live-model campaign remains outstanding**, including real narration/continuity quality, structured output compliance, companion knowledge and feedback proposals with session/campaign approval. Report actual model, calls, usage/cost and retries after that test. Passing deterministic and local database tests does not satisfy this gate.

## Phase 2 key decisions and limitations

- One primary DM runtime, with planning followed by a public-only narration stage. The browser never receives private planning output. Private access is server-only behind verified owner/campaign authorization and an independently checked service RPC. External calls occur outside transactions; fenced commits validate the pinned campaign revision.
- The owner-selected baseline is explicit `gpt-6-astra` with server-only `OPENAI_DM_REASONING=xhigh`; omitting Astra's effort also selects `xhigh`. Explicit `gpt-5.4-mini` and `gpt-5.4` alternatives preserve their prior `none` effort default. Unsupported efforts stop with configuration status; no automatic fallback or switching. Responses retain strict structured output, no provider tools/streaming, `store:false`, bounded attempts/timeouts and content-free diagnostics. The provider has not yet been live-tested. The unchanged 4,096-token reserve includes reasoning and visible output, and the request timeout remains 60 seconds; real Astra output sufficiency and latency remain unverified.
- Bounded context conservatively counts serialized UTF-8 bytes plus framing/schema against explicit model input/output/safety budgets and a 64,000 input operational cap. At most 32 complete exchanges are admitted; missing essential history or oversized mandatory sources pauses instead of silently truncating or inventing continuity. No summaries, compaction, historical/semantic retrieval, embeddings or continuity guarantee for arbitrarily long campaigns.
- Mechanics require explicit owner selection of the small documented house profile; this is not official D&D or automatic interpretation of arbitrary engine documents/prose. Only configured supported item actions and transformations are authoritative. Rest/encounter settings are pinned at their start, so later changes are prospective. Existing inert records are reused rather than duplicated.
- Physical iPhone/Safari and the optional Phase 1 conflict-rebase confirmation remain disclosed, non-blocking unverified items. Mobile desktop-browser viewport checks do not verify physical Safari. No hosted/deployed environment or real-data behavior is claimed.

## Phase 2 remaining work and recommended next step

**Owner setup is the current blocker.** Follow the click-by-click [PHASE2_SETUP.md](PHASE2_SETUP.md) instructions to put an OpenAI key and an explicitly chosen supported model only in ignored `.env.local`; never paste either the file or key into chat. The local Supabase service credential is already configured. Tell the agent only **“OpenAI is configured locally.”**

Then verify configuration presence without displaying values, restart the local preview, run the authorized small synthetic 20–30 turn live campaign and remaining model-dependent browser checks, and record actual model/call/token/cost/failure results. Fix any failures, rerun integrated checks, update this record, commit and push. Only after those gates pass report **PHASE 2 READY FOR OWNER ACCEPTANCE**. Only the owner may approve it. Do not begin Phase 3, deploy or import real campaign/private material.

## Approved Phase 0 checkpoint

The owner explicitly approved **96b69dcd63d2fa015f5e75bcc5d632c41e04369e**. It remains unchanged in Git as the approved restore point.

- **Original implementation verification:** typecheck, lint, production build and 60 automated tests, plus the implementation browser checks recorded in the historical VERIFICATION.md.
- **Independent review reported by the owner:** typecheck, lint, production build, 41 logic/localization tests, 5 HTTP tests and 14 additional HTML/status route checks passed. Independent visual and image-asset verification was **not performed**. Physical iPhone/Safari remains unverified. These records are distinct.

## Accepted Phase 1 status (historical checkpoint)

All Phase 1 subsections below describe that accepted checkpoint, not the current Phase 2 implementation. In particular, their disabled-gameplay/no-service-key statements were true at Phase 1 and are superseded by the explicit Phase 2 record above.

Remote documentation commits through f46014d were safely merged; section 38 remains intact. Our persistence and Chat with DM additions are sections 39 and 40. Only ordered source records and immutable correction-history foundations are added now; no memory runtime is implemented.

**The owner explicitly accepted Phase 1 at commit `a0c7a815b413251df45a961af8c77986975e546f`.** This is owner approval of that implementation checkpoint, separate from the verification results below. The required local database, application HTTP and browser acceptance checks passed on September 18, 2026 UTC (September 17 locally). Physical iPhone/Safari and the optional conflict-rebase confirmation action remain disclosed, non-blocking unverified items; acceptance does not claim they were tested. At that acceptance checkpoint Phase 2 was not yet authorized; its subsequent authorization is recorded above. Deployment, real campaign imports and real DM-private imports remain prohibited.

Three implementation workers used separate worktrees and agreed shared contracts before implementation; the lead integrated their work. The queued Chat with DM addition joined the campaigns/documents workstream, with an additive migration from the sole database owner. This acceptance follow-up preserves that implementation and the approved Phase 0 checkpoint.

Disposable local Supabase is running on WSL 2.7.14 and Docker Desktop 4.91.0 / Engine 29.8.0. The official CLI 2.117.0 release checksum was verified. All three committed migrations applied to the initially empty database. After the owner selected Docker Desktop's localhost-only publishing option, Docker mappings and Windows listeners were verified on loopback before accounts were created. Exactly two synthetic Auth users and exactly one owner-registry row exist. The two campaigns are **Synthetic · Tidal Observatory** and **Synthetic · Copper Orchard**. Only synthetic private canaries were inserted through trusted local SQL for leakage checks. No deployment, real campaign import or real DM-private import occurred.

Two acceptance blockers were reproduced and fixed narrowly: the local Supabase email provider was disabled alongside public signup, and Next proxy normalization changed `127.0.0.1` to `localhost` before the strict origin check. Email/password login is now enabled while global public signup remains disabled; the proxy preserves the original URL. Real tests verify both owner login and rejection of signup, non-owner access and foreign-origin writes. No origin check was relaxed.

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

The verification follow-up at `a0c7a8` changed only `next.config.ts`, local `supabase/config.toml`, the live integration regression, the new `scripts/persistence-app-acceptance.mjs`, local-tooling ignores, and setup/status documentation. It introduced no migration, feature, AI behavior or visual refactoring. Credentials, CLI binaries, logs and disposable configuration remain ignored locally.

This owner-acceptance follow-up changes **only `DEV_STATUS.md`** to record approval of the exact checkpoint above. No application code, configuration, migrations, runtime or campaign data changed.

## Tests and build status

The results below belong to the approved implementation checkpoint. Tests, typecheck, lint and build were not rerun for this status-only acceptance record; its diff was checked and restricted to `DEV_STATUS.md`.

### Automated local checks

- Final type generation, TypeScript check, full ESLint and production build **passed**, rerun after live/browser verification. No lint warnings.
- Ordinary suite: **122 total, 121 passed, 1 explicitly skipped, 0 failed**. It passed against both development and production servers; the final development rerun passed again after browser acceptance. The skipped test is deliberately opt-in and was executed separately below, not silently counted as a pass in this invocation.
- Embedded PostgreSQL tests execute all three migrations with synthetic auth roles: durable reopen, two campaigns, owner/non-owner/anonymous access, immutable document/guide history, revision conflicts/retries, inventory integrity, feedback isolation, ordering and preserved original/correction receipts. These remain distinct from real Auth verification.

### Live disposable Supabase and application HTTP

- Opt-in `tests/persistence-database-supabase.test.mjs`: **1 passed, 0 failed, 0 skipped** against real local Supabase Auth/PostgREST after the provider fix. Public signup is explicitly rejected. All three migration versions and the two-user/one-owner counts were checked directly. Do not rerun its seed step on these populated fixtures; it correctly refuses a nonempty database.
- New application acceptance script: **all 9 groups passed against development on port 3000 and production on port 3001**. Real cookie login/logout/relogin, anonymous and independently authenticated non-owner denial, cross-campaign references/history denial, immutable restore, stale-write conflicts, independent settings, manual character/inventory/session/scene corrections, retry-safe DM feedback, guide separation and persisted relogin snapshots passed.
- Before/after snapshots prove sending feedback changes only its feedback collection: HP, inventory, quests, scenes, public state/time/canon, settings and guide remain unchanged; the other campaign remains unchanged. Unsupported dice/combat/rest/DM-reply/private operations and foreign-origin writes are rejected.
- Synthetic private canaries were absent from every checked public HTTP response and all 20 production JavaScript chunks. Normal authenticated/anonymous private-schema access is denied. No service-role key is in the app environment; no environment or credential file is tracked.

### Browser acceptance

- Real owner sign-in, sign-out and sign-in again passed. Both unrelated campaigns retain distinct characters, places, inventories and campaign languages. The second campaign has no messages or guidance from the first.
- Two Library tabs loaded the same revision: the first saved, the second received a conflict, and its full unsaved draft remained intact. Refreshing saved data presented the newer comparison without replacing that draft. Document history/restoration in the other tab appended a new version and retained older versions.
- Stopping only the local REST service produced a genuine feedback-save error. The complete typed draft remained. Restarting the service and retrying saved it with a timestamp; refresh and relogin retained it. No fake DM reply appeared and sending feedback did not modify the guide.
- Manually saved two DM Guide versions, viewed their history and restored the older as a new current version. The restored text and feedback survived refresh and relogin.
- Manually corrected inventory quantity in the Russian 320px interface; refresh retained the new quantity. Character HP, session recap and manually corrected scene records saved by the HTTP checks were visible in the browser.
- Saved Russian globally, refreshed and signed out/in: Russian returned. Saved English again and loaded it on the narrow-screen settings page. Campaign story languages remained independent. Inspected desktop and 390px/320px screenshots and menu/form interactions with no horizontal page overflow. The mobile inventory dialog scrolls within the screen.
- Game's execution controls remain disabled; only manual records and the separate Phase 0 demonstrations are available.

### Not claimed

Physical iPhone/Safari was not tested. An additional **Keep my draft for the next revision** native confirmation stalled browser automation; completing that optional rebase confirmation remains unverified. This does not negate the observed stale-save rejection and exact draft preservation above. The owner was asked to cancel the synthetic confirmation if visible. No deployment, hosted Supabase verification, live AI, gameplay execution or real-data acceptance is claimed.

## Key technical decisions

One Supabase backend; no browser database client, service key, AI or second runtime. Every public read has an explicit projection. Writes use one allow-listed transactional RPC with expected revisions and stable retry IDs; direct table writes are denied. Document restore appends a version; scene settings revisions never change when preferences change. The private schema has no ordinary application reader. PGlite is development-only SQL verification.

Feedback is append-only, campaign-scoped owner text. The DM Guide is a stable linked reference document using the same immutable history, not established canon. Approved guidance is not applied until a separately authorized Phase 2 runtime exists. Future companion/rest/recipe/combat structures remain inert.

## Known issues

Physical iPhone/Safari and the optional conflict-rebase confirmation action remain unverified and non-blocking for the owner's explicit Phase 1 acceptance. The optional Supabase Vector **log collector** restart-looped on this Windows host and is excluded from the local stack; required Auth/Postgres/REST services are healthy. This collector is unrelated to embedding/vector-search features, which remain unimplemented. A saved Russian preference is loaded after initial page hydration, so a brief English loading render can occur on refresh; the saved preference then appears correctly.

NPC records are supported, but NPC equipment is unavailable in Phase 1; equipment supports players, companions and appropriate transports/mounts. Asset uploads/media generation and gameplay execution are outside this phase. Preexisting history receives deterministic sequence backfill; unknown old commit order is not reconstructed. No secrets or real campaign material are seeded.

## Remaining work

No required Phase 1 acceptance work remains. The owner has explicitly accepted the implementation with the two non-blocking unverified items preserved above. Stop after recording acceptance; do not reset or replace the synthetic fixtures, import real campaign or real DM-private material, deploy, or start Phase 2. Acceptance does not itself authorize any next phase.

## Recommended next step

Await a separate owner instruction. No further implementation or setup is requested by this acceptance. The following local access instructions remain available for optional inspection of the accepted synthetic environment.

Keep Docker Desktop and the port-3000 development server running. Open **http://127.0.0.1:3000/campaigns**. The browser is signed in to the synthetic owner; if sign-in is requested, use the ignored local `test-results/LOCAL_TEST_LOGIN.txt` file directly in the application, never in chat. The temporary production verification server on port 3001 was stopped after its checks.

For optional inspection: open each synthetic campaign and compare its records; in **Chat with DM / Чат с DM**, refresh the saved feedback and restored guide; in **Library**, open version history; in **General Settings**, save either interface language and refresh. Sign out/in once if desired. See [SUPABASE_SETUP.md](SUPABASE_SETUP.md) for the full repeatable procedure. If the older synthetic Library tab has a native draft-confirmation prompt, cancel it before continuing.

The approved visual preview remains separately isolated at **http://127.0.0.1:3000/preview/campaigns/long-road-west/game**. The configured persistent application starts at **http://127.0.0.1:3000/**. No sample campaign is imported into its database.

---

## Historical remote documentation handoff — September 18, 2026

The owner reports having sent Phase 0 approval and the Phase 1 multi-agent implementation prompt to the local development Codex. The implementation status below records the last published Phase 0 checkpoint, not a verification of the local Phase 1 work. Do not interpret its historical approval-pending/stop statements as revoking the owner's subsequent authorization.

Added MASTER_SPEC section 38 and aligned DEVELOPMENT_PLAN milestones 1–3: exact state versus derived memory, source/visibility/revision tracking, model-specific context budgets, bounded retrieval, validated summary/checkpoint lifecycle, corrections/invalidation, idempotent turn/resume behavior, failure recovery and measurable synthetic acceptance gates. These are requirements, not implemented features or guarantees of perfect recall.

This update changes documentation only; no application code, migrations, dependencies, runtime, credentials or campaign data were changed. Tests/typecheck/lint/build were not rerun for this update. Earlier verification results below remain historical.

For the active lead integrator: fetch and safely merge these remote documentation changes at the next safe checkpoint; preserve local work, including the separately requested Chat with DM refinement. Coordinate overlapping documentation edits. Continue authorized Phase 1; incorporate only its memory foundations now. Phase 2/3 runtime work remains deferred until separately authorized.

---
