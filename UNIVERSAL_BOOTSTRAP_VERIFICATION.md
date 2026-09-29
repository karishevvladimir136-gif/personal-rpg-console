# Universal Bootstrap V1 — live-gate defect correction verification

This current section records the correction following the four-call live gate against `85e7d0b17177bf2557cbdfd4287e5c3d64f075e8`. The earlier verification body below is preserved verbatim and describes its earlier offline milestone. Owner acceptance, main publication and real-local activation are pending.

## Root cause and bounded change

The opening DTO was structurally valid when it listed Nadia, but its actor rows were all interpreted as NEW autonomous NPCs. Neither projection nor SQL compared those proposed rows with the existing protagonist. The revised meaning is exclusively additional new visible non-player people/creatures; the protagonist already exists and authority places them once at the approved starting location.

- `src/lib/adventures/bootstrap-contracts.ts`: documents the meaning without changing the public DTO.
- `bootstrap-validation.ts`: checks actors against server-pinned protagonist name/public label; rejects normalized duplicate names. Valid older tickets without the optional public label still work.
- `bootstrap-service.ts`: checks immediate and persisted/recovered/inspected results and owner-edited review against the same immutable context.
- `src/lib/server/adventure-bootstrap-provider.ts`: uses that context during returned-result validation. Only the opening instruction paragraph changes; character extraction paragraph, schemas, primary model/profile, budgets and deadlines stay unchanged. Optional future possibilities may remain unknown for play; genuinely required public opening facts still require review/clarification.
- `src/components/bootstrap/review.tsx`: EN/RU new-person labels and explicit required-number messages. Existing direct owner edits and disabled Create gating remain authoritative.
- `supabase/migrations/202609300031_universal_campaign_bootstrap.sql`: in-place authorized amendment of unactivated migration31. Pins the public Actor label, explicitly verifies the one-protagonist fresh basis, rejects a copied protagonist when storing results, and checks original/reviewed actors plus current campaign identities before materialization. Helpers are private; the RPC remains service-only. No new tables, registry, runtime, inventory or save authority.

A bad historical proposal is retained as evidence and rejected on recovery/approval; it is not silently rewritten into an approvable result. Genuine new NPCs still work. Browser input never supplies this protected context or authority IDs.

## Fresh verification of the frozen correction

| Check | Result |
| --- | --- |
| Focused bootstrap + P0A + Character Model + client imports | **59 tests, 59 passed, 0 failed/skipped**, including **48 bootstrap cases** |
| One fresh complete suite, preview URL 3116, concurrency 2 | **1,790 tests, 1,789 passed, 0 failed, 1 skipped** |
| Explicit skip | Opt-in live disposable Supabase Auth/PostgREST; not executed |
| Route type generation | Pass |
| Full nonincremental typecheck | Pass |
| Repository lint with maximum warnings 0 | Pass, zero warnings; Git-ignored generated `test-results/**` excluded, no tracked files there |
| Production Next webpack build | Pass |
| Populated disposable migration30→31 | Pass; old entities/items/scenes/storage/saves and manifest rows/hashes unchanged |
| Existing starter Fighter/P0A and no-HP save/load/forks | Pass |
| Historical live-evidence hash verification | **37/37 identical** |

The first unrestricted lint invocation found four warnings in `runner.mjs` and `runner-preserved-call1.mjs` in the ignored historical live-gate directory. Those files/evidence were preserved. Final lint command: `node node_modules/eslint/bin/eslint.js . --max-warnings 0 --ignore-pattern 'test-results/**'`. No lint configuration or tracked production file was exempted. Type generation/typecheck and the complete suite were not rerun unnecessarily after this evidence-only lint adjustment.

Focused regression additions cover immediate provider and service rejection of a protagonist copy; normalized names/public label; persisted legacy-result recovery and inspected approval rejection; raw SQL original/review protection; atomic non-mutation on rejection; ordinary NPC creation and one controlled protagonist at the opening location; no automatic quest/reward/private plan; exact commit/retry; unasked null quantities/resource amounts blocked by both service and SQL; manual six/zero stored separately from the unchanged null original. Existing head/epoch/revision/Canon/source/guidance fencing, owner/campaign isolation and old-save regressions remain green.

Local logs are retained under `test-results/universal-bootstrap/correction-*`. Implementation hashes were frozen before the single final suite in `CORRECTION_IMPLEMENTATION_FREEZE.json`. Report/screenshot updates after verification do not change implementation behavior.

## Migration and browser evidence

Migration31 SHA-256: `ffa1d5841e63dcdffb3786cc66e6ded879dc09d40cf10e85205bd161813a95cb`. Migration30 remains `92f4cf70c40855c48332b6738e2a5921819962d1f2631dc6f22425b720a9ea5b`. No real database migration occurred. Current correction creates no new migration number and changes no historical migration30 bytes.

Actual production review components were exercised in the labelled scripted, credential-disabled `/preview/bootstrap` harness in EN/RU at 1440×1000 and 390×844. Blank quantity/balance visibly blocked creation; direct numeric corrections enabled it without another AI action. New-person explanation was readable in both languages/sizes; public confirmation remained required. EN/RU completed flows opened the read-only Game preview. Checked mobile document widths did not exceed the 390px viewport; browser error logs were empty. Eight screenshots are in `docs/review/universal-bootstrap-correction/`; prior twelve screenshots are preserved. This does not claim physical-iPhone, hosted Supabase or authenticated real-local testing.

## Historical live evidence and limits

The original four-call Astra gate and disposable Call4 reproduction remain unchanged. They established the blocking copy defect and the Call1 null-quantity quality finding, rather than acceptance of the pre-correction opening authority. All 37 hashed evidence files are identical. This correction made **zero** provider requests. Character extraction logic/instructions did not materially change; Calls1/3 need no repeat for this review-copy correction.

Revised opening instructions have not been live-tested. Stop for review and separate authorization of at most two revised opening calls. Existing bounded resolver limitations, public/future/private separation, explicit owner approval, ordinary NPC creation, no hidden twist/quest/outcome/PC choice and no retrofit of advanced/Garrick continuities remain in force. Main stays at `6b71f8fd5e1be5c0ae7022c0060835227fffeb81`; real-local activation is not authorized here.

---

## Preserved original verification record — unchanged

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
