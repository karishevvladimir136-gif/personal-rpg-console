# Universal AI-DM Bootstrap V1 — verification and authority record

Implementation branch: `codex/universal-ai-dm-bootstrap-v1`.
Accepted base: `6b71f8fd5e1be5c0ae7022c0060835227fffeb81`.
Owner acceptance, real-local migration and live model-quality evaluation: **not performed**.

## Existing authorities reused

- Authoring: the configured primary Model Runtime's existing `world.compose` task, Responses requester, exact model/profile validation, task output reserve and timeout. No new task, provider, fallback, agent or live request.
- Review: bounded browser-safe creation/opening contracts; original owner text and model proposal retained separately from approved manual corrections. Consequential questions and nullable material fields must be resolved. The owner confirms the opening is public-only before Start.
- Persistence: existing immutable Library/World operation receipts, Campaign, Entity, WorldActor, Item/Storage, World Events, Memory and timeline capture. No new tables, manifests, character database or inventory system.
- Settlement: creation and reviewed opening are service-only validated SQL operations. Opening validates its original exact fence before any write, under the campaign lock. Its own record triggers advance runtime revision; canonical Adventure Start receives the exact resulting in-transaction revision, never a browser-supplied rebase. Opening, activation, public Event, private provenance, receipt and exact manifest commit or roll back together.
- Gameplay: the existing World Logic action resolver and World settlement boundary remain authoritative. Identity/description, descriptive limitations, advisory Adventure context and positively present public actors reach the appropriate contexts. Narration receives server-derived World Logic presence without pretending legacy HP/d20 configuration exists. Character Model knowledge, controlled-PC and public/private filtering are retained.

## Migration impact and compatibility

New additive migration: `202609300031_universal_campaign_bootstrap.sql`. It adds private bootstrap validators/receipt helpers and a service-only bootstrap RPC, extends the Adventure catalog with an optional World Logic opening flag, and synchronizes the SQL model-selection validator with the already accepted `gpt-6-sol` registration. It changes no production default or fallback policy, and adds no storage tables or new mandatory manifest family.

Migration 30 remains byte-identical, SHA-256 `92f4cf70c40855c48332b6738e2a5921819962d1f2631dc6f22425b720a9ea5b`. A populated migration-30 database is upgraded to 31 in disposable PGlite with identical existing Entity/Item/Storage/Scene data and manifest rows/hashes. Existing Basic Fighter creation and migration-30 Start still work with no authoring provider request. Existing no-HP protagonist/opening state, Actor limitations, original authoring history and manifest validity survive save/load and separate restored branches.

The accepted schema is a private single-owner application: Campaigns have no `owner_id` column. The new service uses the existing positive owner-registry authorization, exact campaign membership, service-only RPC grant and server-side `authorizeCampaign` checks. Browser input cannot select owner, execution profile, private state, manifests, mechanical capability tokens or arbitrary authority fields.

## Focused deterministic evidence

The final affected run contains **52 tests, 52 passed, zero failures/skips**: 41 new bootstrap cases, ten existing Character Model regressions and the repository-wide client-import authority analysis. No provider network dispatch occurs: provider tests inject synthetic fetch responses; SQL fixtures create disposable PGlite databases.

Coverage includes:

- Two fresh World → no-HP/no-level protagonist → reviewed Evening Adventure → public opening → real authoritative World Logic observe/speak turns → primary narration → settlement paths. Neither uses `dm.plan`, dice, an accepted quest, reward or fabricated private explanation.
- Fantasy wanderer with explicitly declared compass; Jupiter cargo pilot with navigation/piloting/dock-negotiation and no fantasy items/mechanics.
- Non-humanoid protagonist, empty equipment slots, literal starting resources and manually added ordinary possession through existing inventory.
- Immutable original proposal/manual review, unknown quantity/public-field blocking even after a prose answer, owner/campaign injection, missing World version and unsupported claimed power.
- Interrupted/failed reservation, one-winner reservation race, lost response recovery, exact proposal/commit replay, changed-payload conflict and no extra provider dispatch.
- Stale head/epoch/Foundation revision/Canon generation/Adventure guidance rejection, late creation/opening rollback, sibling campaign non-mutation, private canaries and continued Adventure reuse.
- Pinned model, accepted `world.compose` budget, malformed/incomplete/wrong-model/timeout fail-closed behavior without fallback/retry.
- EN/RU review controls, pending-command parsing, no editable authority IDs and server-only imports/credentials excluded from all client entry points.

## Final integrated verification

The frozen production candidate passes:

| Check | Fresh result |
| --- | --- |
| Complete repository suite, `PREVIEW_URL=http://127.0.0.1:3116`, test concurrency 2 | **1,783 tests: 1,782 passed, 0 failed, 1 skipped** |
| Explicitly skipped case | Live disposable Supabase Auth/PostgREST integration, opt-in only; not authorized here |
| Focused bootstrap + Character Model + import boundaries | **52/52 passed**, including **41** new bootstrap tests |
| Follow-up default-form/test-helper UI checks | **15/15 passed** |
| Route type generation | Pass |
| Nonincremental TypeScript check | Pass |
| Repository-wide lint, maximum warnings 0 | Pass; zero warnings |
| Production Next webpack build | Pass; includes `/api/campaign-bootstrap` and `/preview/bootstrap` |
| Populated migration 30→31, Basic starter, unchanged migration30 digest, save/load/forks/manifests | Pass in disposable SQL cases |
| All client entry-point import/private-authority analysis | Pass in affected and complete suites |

Local ignored evidence: `test-results/universal-bootstrap/full-suite-final.log` and `build.log`. The earlier `full-suite.log` is preserved: 1,783 tests, 1,781 passed, one stale default-form assertion failed, one opt-in case skipped. That assertion expected the old Fighter form's component name; it was updated to the requested World Logic form without weakening the other onboarding checks. Repository lint also identified a test-helper local variable prohibited by the Next lint rule; it was renamed without changing behavior. Focused checks and the final complete run pass after these test-only corrections. Production implementation stayed frozen throughout them.

## Separate browser evidence

Production creation/review components exercised in the labelled scripted `/preview/bootstrap` harness:

| Language / viewport | Path | Result |
| --- | --- | --- |
| EN / 1440×1000 | Fantasy wanderer, manual name/location correction, Evening review, public approval → Game preview | Pass |
| RU / 1440×1000 | Jupiter pilot, manual capability correction, unknown shuttle cause, public approval → Game preview | Pass |
| EN / 390×844 | Jupiter pilot, editable review, approval disabled until confirmation, Start → Game preview | Pass; no horizontal overflow |
| RU / 390×844 | Fantasy wanderer, editable review, public approval → Game preview | Pass; no horizontal overflow |

Twelve synthetic screenshots are in `docs/review/universal-bootstrap/`. Browser error log was empty. The terminal Game view is read-only synthetic presentation; actual gameplay settlement is proven by SQL/production turn tests, not by sending a real DM action in this harness. Preview refresh resets its scripted scene by design. This does not claim authenticated real-local activation, physical iPhone, hosted Supabase or live model quality.

## Preserved limits / stop

Descriptive capabilities do not authorize arbitrary durable consequences. No universal magic/combat/travel/economy engine was added. Initial resources are literal owner-established balances; no currency, progression or reward profile is invented. Pack contents remain subject to existing explicit preparation/pinning and public/future/private rules. Only a wholly fresh, unplayed campaign from the new reviewed creation path can author this opening; partly authored/advanced empty campaigns and already-active Garrick are not retroactively repaired. Existing established continuities resume unchanged.

Provider calls: **0**. Real database migration/import: **0**. Deployment: **0**. Historical dirty checkout and its local main remain untouched. Main publication and real-local activation require separate owner authorization. Stop for review; no further feature lane.
