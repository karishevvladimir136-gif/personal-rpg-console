# Bounded normal Game actions

These pure server planners extend the existing `dm.plan` / `world.resolve`
boundary. There is no new model task, endpoint, dice source, persistence layer,
inventory, wallet or reward ledger. The turn service supplies authoritative
`LoopContext`, a fenced `FoundationCommand`, original input/controlled actor,
validated profile outcome and capability references, and current server-recorded
checks. It must atomically recompute and commit the entire returned `LoopPlan`.

`foundationActionSchema` and `parseFoundationActionProposal` are strict matching
semantic envelopes. Unknown fields, injected prices/patches/rolls and unsupported
actions fail. `null` in the enclosing DM envelope means ordinary legacy play.
`foundationActionContext` returns a bounded public current options DTO, or `null`
when foundations are unconfigured. It excludes private stock, merchant funds,
source evidence, detection state and future opportunities. Never pass a raw
LoopContext to a model or browser.

- `quote` and `trade` carry an existing `TradeIntent`. `expectedPayment` is an
  optional exact condition from the player's request: positive player payment,
  negative merchant payment. It can never override the computed price. Both
  reuse `createTradeQuote`; only `trade` calls `executeTradeQuote`. Quote emits
  a computed public result and leaves state/records unchanged. As in the current
  commerce quote API, a quote requires the exchange to be presently available,
  including affordability and capacity. A merely indicative unaffordable price
  estimate is outside this planner; public item unit prices remain in context.
- `haggle` requires a matching current successful own-player skill check in
  console-basic, or resolved World Logic plus an exact installed capability.
  It emits the commerce domain's current single-use `HaggleGrantPayload` with
  the returned loop version. Code chooses the configured capped modifier.
  The caller must supply the final settled fictional world minute so the grant
  event and its payload match. No model-provided modifier or grant is accepted.
- `theft` / `robbery` transfer only listed public existing merchant item stacks
  and explicitly configured currency. The item primitive validates ordinary
  ownership/stock/storage/equipment rules. Items receive stolen provenance;
  currency provenance is recorded in the immutable result receipt. Fungible
  currency remains the existing resource balance, without a second taint ledger.
  Failed rolls transfer nothing, even if the proposal requests several assets.
  Private detection checks cannot authorize the attempt or leak into its result.
- A robbery may set `merchantUnavailable` only when a separate exact installed
  capability supports that coarse public closure. No witnesses, detection,
  injuries, deaths, police, feelings or relationships are invented. Closure can
  follow a failed public robbery, but no asset transfer can do so.

World Logic capability helpers define finite owner-installed labels:
`foundation.haggle:<merchantId>`,
`foundation.theft.item:<merchantId>:<itemId>:<maximum>`,
`foundation.robbery.currency:<merchantId>:<currencyId>:<maximum>`, and
`foundation.merchant.unavailable:<merchantId>`. Theft/robbery both support item
and currency variants. Exact target and upper bound matter; generic `trade`,
prose, source lore or model responses cannot authorize these effects. Quote and
trade need ordinary configured merchant/player authority and no synthetic token.
World Logic does not roll dice or require HP fields. Console-basic attempts use
the existing server skill check and verify operation/index, player, target and
success arithmetic; a mismatched outcome pauses the complete action.

Reward amounts and eligibility remain owned by `progression/planReward` over
committed sources. This proposal cannot grant rewards, install capabilities,
create items or bypass player control. Manual corrections and newer Pack pins,
timeline epochs, operation identities, heads and revisions remain authoritative.
