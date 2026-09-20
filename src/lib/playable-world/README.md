# Approved Pack preparation

`preparation.ts` is a pure server domain, not a route or persistence adapter.
`draft.ts` is browser safe and validates the bounded owner fields.

## Integration

- Load the authorized exact pinned Pack, its exact immutable source versions,
  current `LoopContext`, and the currently controlled campaign character.
- `buildPreparationDraft(source, context)` returns only selectable review fields.
  Never send `source`, `context`, a Pack record, WorldState, or a plan to the browser.
- `validatePreparationDraft(value, source, context)` rejects unknown fields,
  unbounded values, foreign IDs and changed Thread participant identities.
- `planPreparation(context, source, value)` returns the existing `LoopPlan` plus
  `storageCreates`. Commit ordinary changes, those ordinary storage creates,
  foundation state, WorldState and immutable Events in the same lead-owned fenced
  transaction. Never write part of a plan first. The server retains expected
  timeline, epoch, runtime revision, head and operation-receipt validation.
- `PreparationReviewPanel` accepts `language`, `scopeKey`, `load(signal)`,
  `prepare(draft, operationId)`, and optional `onDirtyChange`. Memoize callbacks;
  include campaign/timeline/epoch in `scopeKey`. The adapter must retain the exact
  original command/fence for an uncertain operation retry. A known stale response
  requires reloading and reviewing; the form does not silently rebase edits.

`source.characterEntityId` is server supplied. Public, approved `canon_at_entry`
claims can support an explicit owner-authored public setup even for an original PC
who has no Pack mapping. Character claims additionally need the mapped current
character in `knownByEntityIds`. Time is always the pinned entry time, even later
in play. Private, source-only, future, inferred, disputed, uncertain-time, expired,
unapproved and other-character claims cannot become suggestions. Each evidence
record must resolve to the exact authorized public source version, and a
future-only source is excluded. Source metadata names and aliases lack independent
knowledge labels, so they need a positive mention in eligible text; otherwise a
neutral editable name is used. Unsupported object records do not become items.

Selected names/descriptions become public only as the owner's explicitly reviewed
setup. No Actor knowledge is granted. Canon-only source evidence remains in private
provenance; it is never relabelled as character evidence for discovered Hooks.
Thread goals are premises with resolver-required progression, not a source-future
outcome, reward, clock or predetermined consequence.

## Identity, edits and stock

The mapped campaign ID is the identity. NPCs use an ordinary Entity and WorldActor
with that ID; locations use an ordinary Location and a location WorldActor;
groups/factions use a coarse WorldActor. Source entity IDs never become campaign
IDs. Thread/step/Hook/storage IDs use the existing deterministic gameplay-ID helper
with the binding and exact source identity, never an operation ID. Unrelated
existing records cannot be adopted by preparation. New records start unselected.
Unselecting an existing record never deletes it.

Names, descriptions, aliases, capabilities, limitations, Thread title/goal/policy,
and merchant participation/label are editable through named fields. Kind is
selectable before creation; group/faction kinds can be corrected afterward. A
person/place cannot be converted to another record family without destructive
identity changes, so that operation is rejected. Corrections preserve current
resources, inventory, locations, player control, progression and Thread completion.

Only an NPC can participate in commerce. The plan reuses its existing merchant
definition/storage, or creates one empty ordinary `Storage` with `kind: merchant`.
This is the existing inventory table, not a stock catalog. Preparation creates no
items, balances, implicit currency, rewards or equipment. Disabling participation
preserves stock and definition history. The lead must support `merchant` in the
existing storage contract/validator and fold `storageCreates` into the transaction.

The versioned `PreparationOrigin` keeps the exact Pack/mapping/source-version
origin and current owner aliases/limitations/description. Immutable
`owner_preparation` Events preserve the reviewed named-field snapshots plus exact
claim IDs, original knowledge/origin classifications and evidence. Keep these
inherited Events in `LoopContext.events` after save/load/fork. The owner editor
replays those snapshots, never current private Actor capabilities or Thread
private text, which may have evolved independently during play. Untouched private
capabilities/goals remain untouched when the owner corrects another field.

An unchanged repeat is a no-op. The outer transaction still owns exact request
retry and concurrent expected-revision semantics. This leaf does not create
receipts, authorize network access, mutate source Canon, run a model, or activate
World simulation.
