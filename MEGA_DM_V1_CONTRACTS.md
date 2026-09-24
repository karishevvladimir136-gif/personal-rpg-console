# Mega DM v1 implementation contract

Frozen for this bounded implementation sprint from `d927ae6c1039d4aeb66e2fc430e66a9a845a45a8`. This is an implementation handoff, not a second product specification. `MASTER_SPEC.md`, `RPG_DESIGN_DOCTRINE.md`, and `MODEL_RUNTIME_BRIEF.md` retain product authority.

## Authority and storage

- Keep one `DmProvider.plan/narrate/feedback` and the existing validated TurnStore commit path. Global Craft and Campaign DM Style are guidance, never Canon, Memory facts, World Events or mechanics.
- Add optional `dmStyle` to existing `CampaignSettings.values`. Its bounded enum fields are `companionAgency`, `descriptionDensity`, `dialogueDensity`, `dramaticPace`, `mystery`, `failForward`, and `tone`; old settings without it resolve neutral defaults. Ordinary `settings.save` and `rpg_settings_revisions` own manual edits and save/timeline rollback. Do not add a style table or mutate old revisions.
- Add owner-scoped, immutable Core Doctrine/Card versions and an approved effective-version pointer/history in Postgres. The initial compact Doctrine and small bilingual original-wording card library are seeded as approved v1 for the registered owner. Loading a campaign save never changes those global pointers.
- A claimed turn's server-private `source.craft` snapshots the exact approved Doctrine, deterministic stage-selected cards, selector policy, and effective settings/style revision once. Subsequent retry/continue uses that persisted source. New turns resolve current global Craft. Do not put raw selection traces in `PublicTurn`, normal campaign snapshots or client bundles.
- The selector uses only authorized current request/public context, fixed stage tags and declared literal relevance triggers. Rank by match score then stable key; at most two optional cards per stage and a bounded total text budget. Zero optional cards is valid. The compact Doctrine is broadly applicable. Narration selection never reads private planning facts.
- Keep `rpg_private.turns.proposal` as the single Chat-with-DM proposal record. Legacy session/campaign guidance approval remains available. New structured Style/Global teaching approval and rejection are explicit, owner authorized, idempotent, and transactionally update either existing settings history or the same global Craft version authority. Global approval requires a manually reviewed generalized draft; campaign feedback is never promoted verbatim by default.

## Interfaces

- `GET/POST /api/dm-craft` serves owner-readable approved effective material/version history and explicit manual version approval or reversal. `GET/POST /api/campaigns/[campaignId]/dm-teach` handles scoped proposal review; both routes require the existing owner/campaign authorization. No raw private turn source or selection trace is returned.
- `CampaignSettings.dmStyle` is optional for legacy persisted values, but new writes validate all supplied style fields. The effective default is computed, never retroactively written to historical settings.
- The existing `GuidanceProposal` transport may gain `rejected` status and explicit `campaign_style`/`global_craft` scopes. No client may decide authority by changing those fields. The existing `guidanceProposal` text remains compatible; owner-facing review supplies the typed style change or generalized Craft draft.
- Runtime integration augments `buildContext` on the existing stages. `plan` can use its authorized private state, `narrate` only public/outcome-safe state, and `feedback` remains OOC and non-mutating. Mandatory state/rules/evidence outrank optional Craft in context admission.
- A frozen synthetic ~48-scene campaign fixture and offline selection/privacy/authority runner are non-canonical. The later live model replay harness is network-disabled by default and makes zero calls in this sprint.

## File ownership

- **Lead only:** shared TS/public contracts and campaign-settings validation, all SQL/migrations, secure server Craft/teaching services and API routes, `DEV_STATUS.md`, integration and final repair.
- **Runtime worker:** `src/lib/gameplay/dm-context.ts`, `src/lib/server/dm/provider.ts`, new pure selector/validation modules under `src/lib/dm-craft/` except shared contracts, and focused runtime tests. Do not edit migrations, `turn-engine.ts`, or public DTOs.
- **UI worker:** owner/campaign React components, navigation/routes, EN/RU labels and styles, and focused UI tests. Use the interfaces above; do not edit SQL, server services, shared DTOs or `DEV_STATUS.md`.
- **Benchmark/QA worker:** frozen fixture, deterministic benchmark, network-disabled future live harness and adversarial tests under `tests/` / `test-fixtures/` with no production-file edits. Report defects to Lead.

Workers do not merge. The Lead integrates dependency-aware, runs focused tests during iteration and one complete integrated suite only after candidate freeze. No live model call or next-phase work.
