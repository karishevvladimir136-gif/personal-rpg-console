# Production Foundation Wave 4 — minimum additions and ownership

Authorized base: `7f4b65ea60e0e497f27528c9efcf73ececa6e360`, freshly fetched and verified September 20, 2026. Waves 1–3 remain owner accepted. This is the bounded playable-world / rewards / commerce foundation, not FRAME, World Lab or Enter This World.

## Existing authorities and minimum additions

- Keep canonical entity/item/storage identities, World Events, one DM/Model Runtime, Memory and Saves/Timelines. No second inventory, wallet, reward ledger, Actor database or backend. Currency balances use existing `Entity.resources`; merchant stock uses existing `Item` / `Storage` rows. No implicit fantasy currency.
- Lead adds a nullable, versioned foundation-loop component to the existing private `world_foundations` save family. It contains profile-owned currency/valuation definitions, merchant capabilities, progression definitions/current progress/pending choices and Pack preparation provenance. Legacy snapshots without the component mean disabled/empty foundations; never fabricate earned history. Ordinary foundation DTOs remain compatible. Only purpose-built allowlisted projections reach clients.
- Definitions and owner corrections are versioned through existing immutable World Events, command receipts and save vault history. Numeric reward and quote valuation is trusted code over owner-approved definitions. Reward entitlement receipts live in existing World Events, not another ledger. Source entitlement identity excludes request and definition version. Forks inherit committed receipts and isolate later rewards.
- New bounded commands extend the existing `rpg_world` service boundary. Lead owns atomic SQL validation, campaign locks, head/revision/timeline/epoch fences, runtime revision, ordinary record changes, World Event commit and existing autosave. One transaction transfers both items and payment or neither. Recorded operation identity supports exact retry; changed or stale input fails. Fictional/operation revisions, never wall time, expire quotes.
- Pack preparation uses an already approved, explicitly pinned Pack and its existing source-to-campaign identity mapping. Select and manually edit a subset before creation. Never automatically materialize every source entity. Canon-at-entry / character-known evidence gates playable/public content; private and future-source material cannot become public through preparation. Repeating preparation cannot create duplicate identities. Corrections are labelled owner authored, preserve exact origin, and do not change source Canon.
- Natural-language trade, negotiation and theft remain typed proposals under the normal Game action boundary. No prose-generated price, reward amount, ownership transfer or arbitrary patch. Theft is not a privileged shop operation. Existing World Logic and console-basic-v1 remain supported; unsupported effects pause safely. No new runtime task is needed.
- Owner controls use bounded named fields, never raw JSON or editable authority/provenance IDs. Every important generated Actor/capability/Thread/merchant/valuation/reward definition has direct manual correction. EN/RU and responsive existing premium shell apply throughout.

## Exclusive ownership and dispatch

Four concurrent slots are available (Lead plus three workers). First dispatch A/B/C immediately after this freeze; UI, natural-language integration, compatibility and independent QA follow in freed slots. Every worker uses its own branch/worktree and never merges. Lead alone owns migrations, shared contracts, final production repairs, integration and DEV_STATUS. Difficult domain/security workers use Astra Max; bounded UI may use Astra Extra High. No Ultra.

| Owner | Exclusive files / deliverables |
| --- | --- |
| Lead | `src/lib/foundation-loop/contracts.ts`, all migrations/SQL, shared production/gameplay/persistence/save contracts and integration, cross-authority server/routes, shell wiring, DEV_STATUS, final integration tests/repairs |
| A — Pack preparation | New `src/lib/playable-world/**`, `src/components/playable-world/**`, `tests/wave4-preparation*`. Strict pure preparation/edit validation, safe owner projection, review UI, deterministic identity/provenance. No shared contracts/SQL/routes. |
| B — rewards/progression | New `src/lib/progression/**`, `tests/wave4-progression*`. Pure bounded definitions, eligibility/valuation/distribution, receipt semantics, pending choices and safe projections. No database/SQL/shared edits. |
| C — commerce | New `src/lib/commerce/**`, `tests/wave4-commerce*`. Pure profile currency/valuation/quote/atomic change planning, inventory ownership, stolen/restricted policy and safe projections. No database/SQL/shared edits. |
| D — commerce/progression UI (later) | New `src/components/foundation-loop/**`, client helpers/locales, `tests/wave4-ui*`. Owner corrections, trade/progression panels, EN/RU. |
| E — action integration (later) | Delegated World Logic/resolver files and `tests/wave4-actions*`. Typed bounded semantic trade/haggle/theft/reward eligibility proposals; Lead integrates SQL and turn changes. |
| F/G — compatibility / independent QA (later) | New `tests/wave4-qa*`, `tests/wave4-migration*`, `WAVE4_QA_REVIEW.md`. Adversarial tests and precise defects only. Lead repairs production code. |

Leaf contracts may be proposed by workers but become shared only through Lead review/integration. Workers run focused tests and report SHA/files/results/limits. All databases and providers in verification are disposable/synthetic/scripted. No real data migration, live provider calls, paid evaluation, research, deployment or next phase.

## Completion gate

Fresh full suite, typecheck, repository zero-warning lint, production build, legacy/Wave1/Wave2/Wave3 disposable upgrades, Pack→Actor/Thread, reward→inventory→trade→save/load and receipts/theft/privacy flows. Separate EN/RU desktop/mobile browser checks; no physical iPhone claim. Lead reports implemented/integrated/deterministically verified/browser checked separately from no live quality evaluation and no owner acceptance. Push integration and worker branches; main stays unchanged. Report material gaps honestly and stop for owner review.
