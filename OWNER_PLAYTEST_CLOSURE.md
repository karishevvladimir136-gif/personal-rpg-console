# Owner playtest closure candidate

Base: `02ebc4b42ff06606b25e9989bb7f9eda068727d7`.
Branch: `codex/owner-playtest-closure`. Not activated or owner-accepted.

## Runtime closure

The preserved Iris operation `574862da-14ee-4881-a5cb-6a23f144458e` is untouched.
Its original nonretryable `plan/context` failure was reproduced read-only before
implementation. Public narration preflight fitted while private planning did not.
The original Memory response/stack was not saved; both plausible private-summary
visibility states reproduced the capacity failure against the frozen source.

One shared `buildAstraPlanContext` now projects the Astra packet before required
sizing, Memory retrieval-room calculation, optional-history selection and final
assembly. The final provider guard uses the same actual schema, instructions,
receipt/check envelope, model/reasoning/tier body and 2,048-byte framing reserve.
Legacy planner-only instructions/schema and house-profile text are not charged
against an Astra packet that will never send them. Authoritative current state,
current scene, private state, relevant Canon/Memory and world evidence remain.
Generic legacy context and public narration caps are unchanged.

Read-only measurements of the frozen owner source (no owner provider call):

| Packet/coverage | Required bytes | Full selected bytes |
| --- | ---: | ---: |
| Old private precursor, private summary ready | 67,150 | — |
| Old private precursor, private summary not ready | 68,094 | — |
| New actual Astra packet, public summaries unavailable | 72,931 | 79,620 |
| New packet after first public summary | 61,687 | 71,305 before optional trimming |
| New packet after both public summaries | 49,954 | 62,167 |

The last two columns use the real provider schema/body accounting. Measurement
temporarily used an in-memory 96k budget to inspect untrimmed sizes; production
remains **64,000 bytes**. Completing summary coverage solves the demonstrated
pressure without raising the cap or dropping mandatory evidence.

Durable begin and runtime pin still precede all context/provider work. Astra now
claims the operation before its private-plan Memory preflight, so duplicate
requests cannot each initiate preflight for that operation. The claimant can
complete up to three existing summary jobs, then performs one deterministic
Memory reread/re-evaluation. There are no sleeps, polls, or unbounded retries.
If another worker still owns essential coverage, capacity remains a safe,
retryable pause rather than a permanent failure. Summaries remain derived,
source-linked evidence and do not reconstruct gameplay state.

## Rest provisions and Migration 49

`202610090049_astra_rest_provisions.sql` is required for independent SQL parity.
It was applied only to disposable PGlite databases. Owner DB remains at 48.
It adds one private provision predicate and replaces exactly two guarded
predicates in the effective Migration-48 reconstruction function. Existing
function identity/permissions and unrelated 47/48 authority remain intact.

An accessible ordinary Item unit qualifies when category is `food` or `supply`,
or it has the explicit supply tag. Weapons, meal/coffee servings, inaccessible
NPC inventory, zero quantities and private/restricted sources remain excluded
by the shared classification and existing ownership/storage/visibility guards.
One quantity unit pays one provision unit. No Item category is rewritten.

The disposable Iris-shaped acceptance uses a known visited roadside market,
public tonight-sleep permission, no persistent safe-location entry, no encounter,
HP 10/10, silver 2, minute 13 and one untagged ordinary vegetables Item. Fake
Astra reaches production planning, proposes existing `formal_rest` with temporary
safety, and commits quantity 1→0, minute 13→493, HP 10/10 and one complete rest.
Money, Location, Quests and other Items stay unchanged. Exact committed replay
performs no provider work and applies no second consumption or time advance.

## Verification at runtime checkpoint

- Context/Memory/runtime/provider/parser focused batches: 77/77 passed.
- Rest/ordered effects/recovery/Migration-49 batch: 44/44 passed.
- Bounded live-harness offline tests: 3/3 passed.
- Populated 48→49 preserves 15 relevant campaign-table fingerprints, committed
  and pinned pending turns, other Astra definitions and target function grants.
- Migration-49 independent SQL rejects a forged inaccessible food payment.
- Integrated full suite, prose/UI verification and authorized disposable live
  acceptance are pending at this runtime checkpoint.

## Owner safety

No owner gameplay, saves/timelines, database migration, media call, main merge,
owner app/environment change or deployment is part of candidate development.
The only authorized live work is one fresh disposable long-rest turn after
offline gates: one Astra High planner and one Astra Medium narrator, default
tier, at most two requests, no quality retry and a conservative $2 ceiling.

## Prose

English campaign narration receives one compact instruction for idiomatic,
natural conversation while retaining character/setting voice and intentional
fantasy diction. Other campaign languages are unchanged. There is no text
postprocessor or hardcoded replacement dialogue. Tests inspect the actual
public narrator instruction, not the generated sentence.

## UX

Pending its separate implementation commit after runtime/prose focused gates.
