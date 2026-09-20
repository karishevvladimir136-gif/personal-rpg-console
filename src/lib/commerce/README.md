# Commerce authority

This server-only domain reuses `Entity.resources`, canonical `Item` and `Storage`
records, public World Actors, and immutable World Events. It does not persist
anything or introduce an inventory, wallet, shop database, dice function or route.

`parseCommerceDefinitions` validates the currency, valuation and merchant subset
of the lead-owned foundation loop state. Currency IDs and resource keys are
explicit; there is no default currency or conversion between currencies. Unit
values, quantities and balances are bounded integers in the existing persistence
range. Merchant `buyBasisPoints` means the merchant buys the player's offer;
`sellBasisPoints` means the merchant sells its stock. Purchase costs round up and
sale proceeds round down per item. Negotiation stays within the configured spread.

`projectCommerce(context, playerEntityId)` returns allowlisted player inventory,
currency balances and currently available known, live, colocated merchants. A
private policy excludes its entire item row, including identity, name, quantity
and valuation. Merchant funds and capacity totals are omitted. The lead's global
snapshot projection must independently exclude private item rows.

`createTradeQuote(context, command, intent)` validates buy, sell or barter and pins
the command's campaign/timeline/epoch/head/revisions, profile, definition versions,
row revisions, quantities and computed prices. `executeTradeQuote(context, quote)`
recomputes the whole quote and returns one `LoopPlan` containing both sides of item
and currency transfers, the updated loop state, and a public `commerce.trade`
receipt. Partial stacks get deterministic IDs and retain their explicit policy.
No input is mutated on success or failure. The lead's service/SQL must commit all
parts together under its existing locks and fences. Exact successful retries must
return the stored result before calling the planner; it rejects already committed
operation IDs. These pure tests do not substitute for SQL transaction tests.

Favorable haggling requires an already committed, public
`commerce.haggle_granted` event. Its exact `HaggleGrantPayload` pins player,
merchant, profile, loop version, merchant version, timeline/epoch and fictional
world minute. The normal Game action resolver establishes semantic eligibility;
the merchant definition supplies the bounded amount. Event prose or a client
request cannot grant it. The next trade records the grant ID and consumes it;
later state/timeline/time changes invalidate it. No wall-clock expiration exists.

`validatedItemTransfer` is a bounded transfer primitive for an already authorized
trade or normal Game action resolution. It verifies scope, ownership, public
policy, agency participation, colocation, live actors, storage, quantity and
equipment restrictions. It does not establish consent or success of theft. A
normal Game resolver may mark the returned transferred policy stolen only after
validating that action and its recorded check/World Logic authority. There is no
privileged theft endpoint.

Legacy disabled state (`version: 0`, empty definitions and empty World) projects
as empty. Active trading requires real configured actors and owner-approved
definitions. A merchant storage must be bound to its canonical merchant entity;
the lead owns the additive `merchant` storage kind and migration.
