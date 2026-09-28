# Bounded loot integration adapter

This server-side leaf returns ordinary `LoopPlan` values. It never commits, calls
providers, creates a ledger, or writes a raw patch from a model. The Lead must
wire it into the existing normal foundation action/check/atomic settlement path.

- DM/player action input is exactly `search`, `access`, or `take` as parsed by
  `parseLootIntent`. A free-form interpretation selects supported references;
  unknown approach/object scope returns a safe pause.
- Authenticated server configuration uses `planLootObjectCorrection` with a
  strict `LootObjectVersion` and the authenticated configured owner ID.
- State is reconstructed from private `loot.object.configured`, `.changed`, and
  `.corrected` Events in the service-supplied exact inherited timeline membership.
  Each payload has expected revision, object, trusted full policy, positive
  object/contents discovery grants, private item properties, and authority.
  An object grant includes its recorded appearance/access, lock/structure class,
  portability and environment; null keeps an unknown property unknown. Item true
  identity, hidden effects, content policy and check DCs remain private.
- Item quantities/owner/storage/equipment stay in normal Item/Storage rows.
  Materialization uses stable object/content IDs once; private metadata Events
  record true identity/provenance, while public Item rows contain appearance only.
- Access success uses exact recorded server check IDs/DC/Actor/target/stat;
  properties/capability/environment requirements and finite effects are trusted
  policy data. Noise is observed only by the initiating Actor. No guard response
  or omniscient knowledge is inferred. Fragile loss is bounded quantity depletion.
- Taking reuses `itemTransferChanges` and existing private ItemPolicy provenance.
  Its current same-location/known owning Actor assumptions remain applicable;
  remote/unknown owners require a separately validated shared transfer extension.
- `planBoundedReward` wraps existing `planReward` and retains its entitlement,
  eligibility, Off-mode, recipient, quantity and receipt authority. Integrity
  dimensions/policy remain private and are explicit profile ranks, not D&D tables.

The planner needs server-injected checks and exact trusted policy from the latest
object Event, plus ordinary fresh FoundationCommand fences. Runtime authorization,
leases, atomic SQL commit, operation replay, current source restrictions and save
membership are existing Lead-owned authorities. This module alone is not a live
search API or proof that normal gameplay wiring has been completed.
