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

## Owner-review correction addendum

- `feedback()` may return a bounded typed `teachingCandidate` beside human-readable text. A campaign candidate changes one to three of the seven Style choices; a global candidate supplies a bilingual generalized Card draft. The provider cannot apply either. The existing turn proposal remains the sole review record, and approval still uses settings revision/timeline or immutable global Craft version authority. Legacy text-only guidance remains readable and reviewable.
- New claims use selector policy `mega-dm-v1-public-context-2`: literal input plus at most 512 characters from the current public scene and location label. The SQL selector never reads DM state, private Memory or future sources, ranks by trigger count then key, and pins at most two cards per stage. Older `mega-dm-v1-literal-1` pins remain valid for previously claimed turns.
- `test-fixtures/mega-dm/frozen-craft-v1.json` and `evaluation-pack-v1.mjs` freeze the exact seeded version-one Doctrine/Card content and synthetic fixture digest. The future network-disabled replay request records each arm's content digests, selected/eligible cards, selector policy, model identity, scene, literal input, adjudicated outcome and authorized public-before state. No owner-active Craft is read during replay.
# Cognitive Worlds / Living Characters completion addendum

This bounded Mega DM v1 completion starts from `43ad7d696830847434ddb3909d4b14e2c9b7bed0`. It does not add a second DM, Memory, World, Actor, save or timeline authority.

- Cognitive, Living Character and Afterglow guidance is versioned owner-approved DM Craft. The existing stage selector admits at most two relevant Cards; the Core Doctrine remains compact and yields to state, Canon, rules, secrecy and player agency. Frozen old turns keep their pinned Craft.
- `CampaignSettings.dmStyle` gains two optional owner-controlled fields: `emotionalTone` and `tragedyIntensity`. Old seven-field revisions remain valid and acquire effective defaults only for new context construction. Teach DM's seven-field candidate is unchanged.
- Character Model v1 lives in the existing `rpg_private.dm_state.contents.npc` namespace using one bounded `character_<actor UUID>` entry per NPC. The value is a strictly validated compact JSON document. The existing turn checkpoint/commit, private-state revision, event receipt and save/timeline vault remain its only mutation/history path. No client DTO carries a Character Model.
- Identity is owner/Canon-established and is immutable across ordinary DM turns. Ordinary turns may propose only current state tied to their exact operation receipt and beliefs, relationships and episode interpretations linked to positively known Memory evidence. The server validates exact actor, campaign, operation basis, known evidence and bounded size before the existing atomic commit; retries use the pinned turn and cannot double-apply. Owner correction may replace identity only through an explicit owner-authorized, fenced revision path, never generated narration.
- The Character Packet is deterministically selected from the pinned source, limited to relevant actors and bytes. The plan stage may see authorized private interpretation; companion mode sees only the speaking actor's model and positive actor knowledge. Narration receives only an observable voice/behavior projection, with no private motive, belief or secret relationship field.
- Synthetic character/evaluation fixtures and the future live harness are development-only and network-disabled. Their quality claims remain unproven until separately authorized live review.
