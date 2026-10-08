# Live play blockers — diagnostic checkpoint and reward authority boundary

**Status (2026-10-07): BLOCKED.** This isolated branch starts from `4f64a01d69d7c3a299283e63154d559f03d38de0`. It adds a private Astra execution-stage diagnostic, but does not implement the reward bridge or the requested UI changes. Nothing here is activated on the owner app or database.

## Historical Iris operation

Operation `989bea8a-b105-4e35-852f-a2d897e5e177` in campaign `39d1b773-0b4f-4f4a-b227-6b3654296d75` remains failed and untouched. The saved final proposal and resolution show a payment still due, with no item/resource grant. No narration or committed runtime event is present. The exact post-proposal rejection stage is not recoverable from existing evidence; this checkpoint does not claim that the reward gap caused that failure.

## Diagnostic implemented

Additive private Migration 44 (`202610060044_astra_execution_diagnostic.sql`) adds a nullable stage marker to `rpg_private.turns` and a service-role-only action on the existing runtime RPC. It records bounded stage, phase, safe failure category, and whether a narrator response and parse occurred. It stores no prompt, provider response, narration, or DM-private prose. Historical saves without the field continue to restore. The production Astra turn records the stages around final validation/checkpoint, public narration preparation/provider/parse/safety/checkpoint, and final commit. A failure persists its furthest known stage on a best-effort basis while preserving the original error.

Migration 44 was applied only to disposable databases. It must be applied before code using its diagnostic action is activated. It has not been applied to the owner database.

## Reward authority boundary

- The live Iris campaign has no Foundation currency, reward, merchant, or pending reward definition representing the promised payment.
- `planReward` requires an approved versioned `RewardDefinition`, an eligible Quest/Thread/Event source, and a private `reward.granted` World Event as its exact-once receipt. The existing reward system deliberately has no separate ledger.
- Migration 39 makes the World Foundation historical after Astra takeover. Its `astra_takeover_freeze_world` trigger rejects Foundation changes, and `astra_takeover_freeze_events` rejects new World Events, apart from timeline restoration.
- Astra's current final validator and Migration 38 commit guard permit bounded resource and item decreases, not a new currency balance or newly minted item reward. Private patches cannot authorize the grant.

Thus the existing reward planner cannot pay the ordinary post-takeover campaign as-is. A safe bridge requires an explicit decision about which existing Foundation reward definitions and receipt writes, if any, may remain live after takeover, along with saved-timeline, owner-approval, and ordinary-gameplay validation rules. Weakening Astra's generic state validator, creating a parallel reward ledger, or narrating payment without a durable transfer would violate the stated authority constraints. This branch makes none of those changes.

The requested reward acceptance scenario, objective synchronization, lodging bridge, Game/media/Journal/Item/Character/Map cleanup, and screenshots were not attempted after this authority boundary. No paid provider calls were made.

## Verification

- Diagnostic disposable migration and failure-stage tests: 10/10 passed.
- Focused Astra/diagnostic/migration/takeover checks: 35/35 passed.
- Complete repository suite: 2,112 passed, one existing skip, zero failed (2,113 total).
- TypeScript, zero-warning ESLint, and production build passed.

**Next decision:** authorize a narrow post-takeover exception or adapter for the existing Foundation reward authority, including how a grounded offer obtains an approved currency/item/reward definition and a durable exact-once receipt without making historical World Actor/event state a second ordinary-play authority. Until that decision, this branch is a diagnostic checkpoint only and must not be activated.
