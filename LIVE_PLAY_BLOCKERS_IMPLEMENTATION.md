# Live play blockers — final isolated closure candidate

## Closure from the accepted checkpoint

This continuation starts at `fe7c577932612040b17a7ec79efd22fc88392b45` on `codex/live-play-blockers`. Migrations 44 and 45 are retained exactly as the reviewed diagnostic and bounded runtime-settlement work. Additive Migration 46, `202610060046_astra_live_progression.sql`, is the only new database authority in this closure. The owner database remains at its prior level; 44, 45 and 46 were applied only to disposable databases. Main, the owner campaign and the historical Iris operation `989bea8a-b105-4e35-852f-a2d897e5e177` remain untouched. There were no real model, media or review-provider calls.

## Earned progression after takeover

The owner-authored progression enabled state, tracks, thresholds, option definitions and reward definitions remain frozen. Astra can propose only an existing track, the controlled recipient and a bounded earned amount. Shared pure progression planning computes the new value, rank and pending choice; Migration 46 independently checks the pinned result before atomic commit. The committed campaign/timeline/operation turn is the exact-once receipt. There is no new World Event or second progression ledger. Save/load and replay keep the same progress and pending choice.

An earned choice is explicitly selected by the player through a narrow service action with exact pending ID, option ID, track version, timeline, head and runtime fences. A duplicate choice returns the existing result; a stale or different choice conflicts. Selected unlocks are projected from the historical actor baseline and the current mechanics progress. Future Astra private context receives the derived capability. The historical World Actor and World Event rows are unchanged. The World Foundation exception is restricted to mechanics `loop_state.progress`, `pending` and its version; World authoring remains frozen.

## Trade, story media and player-facing surfaces

Post-takeover Trade now routes an explicitly confirmed, recorded mundane-stock purchase through the existing Astra turn store and Migration 45 settlement validator. It recomputes the current quote, uses the same campaign/timeline/operation receipt, debits the player, credits seller funds where applicable, transfers the Item and commits narration atomically. Exact replay does not charge or transfer twice; insufficient funds produce no settlement. The UI shows only public stock that fits this bounded path and hides sale/haggle controls. Unsupported stock is unavailable rather than sent to frozen Foundation authority.

Committed turns expose only their public narration Scene ID as presentation metadata. Accepted FRAME/VIDEO for that Scene renders after the matching saved turn, or after the opening if generated before ordinary play. Gallery history remains unchanged. This adds no fake gameplay turn; generation remains separate. The permanent top scene card no longer duplicates large media. Journal Quests no longer contains Adventure management; the owner entry is under Campaign Settings → Advanced. The disposable Short sword preview now supplies an authoritative weapon rule so Item Details visibly renders **Weapon · Damage 3 · Quantity 1 · Equipped · Main Hand** without hard-coded damage in presentation.

The review-only synthetic Game preview can show a committed turn with accepted inline FRAME, and the review-only Inventory preview can open the Short sword detail directly. These preview options do not read owner data or dispatch gameplay/media. The prior Phase-0 layout and compact composer tool row remain unchanged. The optional Map disclosure regrouping was not needed for this bounded closure; Atlas versus Location illustration remains distinct.

## Verification and remaining limits

Disposable Migration 43→44→45→46, populated 45→46, old-save restoration, progression exact-once, advancement, frozen World Actor/Event and private DTO tests are in `tests/astra-live-progression-sql.test.mjs`. Commerce, Trade, Game media, Journal and Item regressions run against the existing production components. The final focused batch passed **99/99**. The complete suite passed **2,139/2,140** with zero failures and one existing skip. TypeScript, zero-warning ESLint and the production build passed. The final Trade wording and synthetic preview label were separately covered by six focused translation/UI checks plus the final typecheck, lint and build; no runtime authority changed after the complete suite.

Updated disposable captures in ignored `test-results/live-play-ux/` are `closure-inline-frame-large.png` (desktop Game, story turn then accepted FRAME), `closure-game-390px.png` (actual 390px viewport with no horizontal page overflow), `closure-composer-tools.png`, `closure-journal.png`, `closure-item-damage.png`, `closure-trade.png`, and `closure-progression.png`. All use synthetic public records and locally served schematic art. The item capture visibly shows Damage 3 from its review-only `itemRules` entry. These screenshots are local review artifacts, not committed gameplay or provider outputs.

This path does not add a lodging permission subsystem. Trade after takeover is limited to one recorded mundane stock purchase with an existing currency, bounded price and available funds; sale and haggle remain unavailable. The historical Iris failure's original cause remains unknown. No owner playtest or provider-quality claim is inferred from scripted/disposable tests. Eventual owner activation needs separate approval for migrations **44 → 45 → 46**, followed by code activation; none occurred here.

## Earlier checkpoint report (historical)

# Live play blockers — isolated implementation candidate

## Scope and authority

This branch continues the diagnostic checkpoint at `fe2ed1f6ca0ae2c290b5cd967501e3a4978f18dd`. Migration 44 remains an isolated private execution-stage diagnostic. The historical Iris operation `989bea8a-b105-4e35-852f-a2d897e5e177` was not retried, cancelled, repaired or reattributed; its exact historical rejection remains unknown.

The owner authorized Astra ordinary mechanics after takeover while retaining the Migration 39 freeze on historical World authoring, old World Logic ordinary-play decisions, World Actors, topology, and generic World Events. Migration 45 provides the narrow mechanics bridge. The committed, campaign/timeline-fenced Game operation is its exact-once receipt. It creates no second reward ledger, Item store or Quest store.

## Runtime settlement

The private Astra final may include one bounded settlement intent. Current kinds are `job_offer`, `job_complete`, `job_reward`, `mundane_grant`, `currency_transfer`, `item_transfer`, and `mundane_purchase`. The model cannot supply RecordChanges, revisions, server IDs, SQL, or a receipt identity. TypeScript plans exact changes from the pinned current source; Migration 45 independently recomputes the plan and pins it privately before narration. The public narrator receives only the validated public outcome. The existing Astra final/commit validator still checks the base proposal and generic tool receipts. The settlement wrapper applies the recomputed changes with the existing `runtime_change` inside the same SQL transaction, updates the committed revision, then captures the paid autosave. A failure rolls back narration, mechanics, Quest, Item, currency definition, and save together.

The shared pure settlement core supplies bounded currency arithmetic to existing authored Foundation rewards and Astra rewards, and exact Item transfer changes to existing commerce and Astra transfers. Existing Foundation RewardDefinitions and their pre-takeover path remain intact. A new ordinary job or direct mundane gift needs no pre-authored RewardDefinition.

An ordinary currency name is normalized to bounded lowercase words. A new name derives a stable campaign currency ID and resource key, checks collisions, and appends only a versioned currency definition to the existing mechanics registry. No World Actor, route, thread, policy, historical event or authored World record is changed. Existing compatible definitions are reused. A mundane reward Item is one bounded `food`, `supply` or `misc` record with server-derived identity, empty mechanics and no equipment power. A bounded purchase uses an existing public NPC stock Item and an existing currency: hero debit, NPC credit and Item transfer commit together, with a server-derived split ID if needed. It never offers unknown stock or debits an insufficient balance. Jobs use the existing public Quest record with bounded pinned terms and one reward operation marker. The current Game objective already reads an open durable Quest. Exact replay returns the committed result without paying again.

**Remaining authority boundary:** Historical commerce and progression controls still call `public.rpg_world`. After takeover Migration 39 correctly rejects that path because it would mutate frozen World Foundation loop state and write World Events. The new Astra purchase intent handles one ordinary purchase from recorded, present NPC stock; it does not make the old quote UI valid after takeover or cover every commerce operation. Existing progression tracks, earned progress, pending choices and capability unlocks live in the frozen Foundation. The existing reward/advancement planners also emit World Events, and advancement changes World Actor capabilities. This branch does not reopen those writes or introduce a second progression store. Full post-takeover progression needs a separate narrow mechanics-only authority design, including save/timeline and capability semantics; it is **not verified ready** here. Fresh bootstrap has progression off and no configured track, so no level-up is implied. This sprint does not add a lodging subsystem. `safeLocationIds` and rest records do not express a one-night NPC lodging permission from ordinary dialogue without changing owner/runtime configuration authority, so the DM may narrate hospitality but cannot yet grant a durable rest permission through this narrow settlement field.

## Player-facing closure

- Game gives story and composer the primary space. The scene heading is compact and the Phase-0 ambient treatment is subtle.
- FRAME and VIDEO sit with OOC, Dice, Take note and What do I know? as secondary composer actions. Accepted media appears beside its scene in the transcript and remains in Gallery; draft pixels stay out of ordinary play.
- Healthy flow hides request/history controls. Recovery appears when an actual saved-turn problem occurs. Manual encounter controls sit under Advanced.
- Journal Quests shows recorded jobs/quests/leads. Adventure management moves to Advanced; People still contains ordinary known NPCs.
- Item Details shows public image, description, type, authoritative weapon damage, equipped slot and ownership in player language. Accepted Item art appears in equipped slots; unaccepted drafts do not.
- Map distinguishes a Location illustration from Atlas artwork and opens at a populated level of the known current area.

The UI screenshots in `test-results/live-play-ux/` use the real components with a disposable public fixture and schematic locally served accepted art. They make no image request. The read-only preview has no live `PlaySnapshot`, so its Item screenshot cannot show a weapon's Damage value; the focused Item test proves Damage 3 appears only when the authoritative `itemRules` entry is present. A full-page 390px browser capture may stitch the fixed bottom navigation over content outside its viewport; the viewport itself remains usable.

Screenshot files: `game-desktop.jpg`, `game-390px.jpg`, `composer-tools.jpg`, `contextual-media.jpg`, `journal-quests.jpg`, `item-detail.jpg`, `equipment-slot-art.jpg`, `map-art-distinction.jpg`.

## Verification and activation boundary

Disposable clean and populated Migration 43→44→45 tests passed **10/10**. They covered old rows and immutable save manifests, paid job offer/completion/reward, direct lazy currency and Item grant, present NPC transfer, bounded purchase, exact replay, paid save/load isolation, failed pre-commit and injected settlement-stage rollback, restricted Item policy, World Event freeze and private DTO exclusion. The final focused batch passed **70/70**. The complete repository suite passed **2,130/2,131**, zero failures with one existing skip. TypeScript, zero-warning ESLint and production build passed. All provider decisions in these tests were scripted; there were zero real model/media calls.

This candidate remains **blocked for full post-takeover mechanics acceptance** by progression. A safe follow-up must separate earned track/progress/pending mechanics from the frozen historical World Actor and World Event path, including exact operation receipt, save/timeline restoration and capability unlock authority. The existing `character_sheet` bootstrap schema also requires `level` and `tier` to remain null, so a generic level-up must not be inferred from a Quest reward. The limited ordinary purchase path is ready for review, while the historical trade quote UI still has no post-takeover route. No owner activation is authorized by this report.

The prior diagnostic checkpoint is preserved as historical evidence in `LIVE_PLAY_BLOCKERS_BOUNDARY.md`. Migration 44 and Migration 45 are for disposable verification only in this branch. Neither has been applied to the owner database. No owner gameplay, provider/media request, main merge, app activation or deployment is part of this candidate.

The disposable screenshots listed above remain outside the committed repository in ignored `test-results/live-play-ux/` and can be opened directly for visual review.
