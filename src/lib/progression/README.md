# Bounded reward and progression planning

These server-only pure functions consume an authorized `LoopContext` and fenced
`FoundationCommand`, and return an atomic `LoopPlan`. They never persist records,
call a provider, or approve model output. The existing service owns authentication,
the active timeline, locks, exact operation retry, persistence and autosave.

- `planProgressionDefinitions(context, command, { progression, tracks, rewards })`
  accepts explicitly approved owner definitions. Existing definitions are unchanged
  or incremented exactly one version. Removing a track with current progress fails.
- `planReward(context, command, { rewardId, expectedRewardVersion })` uses only saved
  definitions. Quest sources must be complete; Threads must be fully resolved;
  Event sources must be committed `world.thread.advanced` or `world.logic.resolved`
  Events, with no future-source evidence. An uncommitted model classification has
  no authority. An owner can define a package before its source becomes eligible.
- `planAdvancement(context, command, { pendingId, optionId, expectedTrackVersion })`
  selects the next earned rank. Capabilities are finite approved access labels;
  they do not install executable rules, combat modifiers or universal spells.
- `planProgressionCorrection(context, command, { entityId, trackId,
expectedTrackVersion, value, rank, unlocks })` records an owner-authored baseline
  correction and explicitly reconciles pending choices to the current definition.
  It does not create fictitious historical earnings or delete receipts.
- `projectPublicProgression(context)` returns only current public progress and
  earned choice options. Private definitions, rewards, source identities, Event
  payloads, hidden Actors, and future opportunities are never part of that DTO.

Source entitlement identity is campaign + source kind + canonical source ID. It
deliberately excludes definition ID/version, operation ID and beneficiary list.
One source funds one package; another legitimate occurrence requires a new source.
The receipt is a private `reward.granted` World Event with payload
`{ schemaVersion: 1, entitlementId, source, rewardId, rewardVersion, profile,
recipients, entries, pendingIds }`. The receipt captures actual integer shares,
item transfers and pending identities. There is no separate reward ledger.

The service must supply current inherited Events and same-timeline vaulted reward
receipts in `context.events`, excluding sibling future history. Ordinary source
Events come only from current history. A source receipt still blocks a new claim
after an old load on the same timeline, including a new request or edited reward.
Exact operation retries are replayed by the existing command receipt service.

`party_equal` conserves each approved integer total: sorted canonical recipient
IDs receive equal quotient shares and the first remainder recipients receive one
extra unit. It never multiplies a party package by party size. Full item transfers
preserve the original ID; split shares use stable entitlement/item/recipient IDs.
Every share enters Storage owned by its recipient. Original quantity reductions,
new rows, item policies, resource balances and receipts are one plan. Item rule
configuration and provider-independent mechanics remain owned by their domains.

Classic XP and generic tracks use owner-defined increasing thresholds. Milestone
tracks count approved achievements using ordinal thresholds, without fake XP.
Ranks with no options advance automatically; ranks with options require explicit
ordered selections. One capability cannot be installed twice. A package with
insufficient supported remaining choices fails as a whole. Definition changes
leave earned choices intact but unavailable until explicit owner reconciliation.
Off preserves history and choices and skips progression rewards, while approved
item/currency effects and the source receipt still commit. Zero tracks are valid.

This baseline does not implement reputation/relationship authority, arbitrary
ability mechanics, prerequisite graphs, career promotion, repeated-use farming,
challenge scaling or a pacing engine.
