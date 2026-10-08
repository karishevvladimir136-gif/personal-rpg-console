# Astra Freedom closure — offline gates passed; live protocol incomplete

Starting checkpoint: `27be7c5f300e5607769814664b16aefb68e8cd11` on `codex/astra-freedom-pass`. Main remains `edeb3542cb00c068b129faa95f24a21eeb3b9425`. This document records implementation and disposable verification; it does not authorize owner activation.

## Architecture

Astra remains the sole fictional DM. Up to six ordered effects may request bounded settlement or existing check-free mechanics. `astra-mechanics.ts` calls the established `mechanicPlanForActions`, `validatePlan` and `resolveMechanics`; it does not introduce another action interpreter or dice lifecycle. Supported actions are resource spending, Item consumption/transfer/equipment, Quest transition, known Location travel, rest entry/interruption/completion and recipe preparation/serving. Check-bearing foraging, transformation and encounter actions remain on existing Astra tools and legacy mechanics rather than a new parallel check checkpoint.

`formal_rest` derives entry/completion, stable Rest identity, eligible controlled participants and available tagged supplies. Existing profile/settings authority calculates recovery, elapsed time and effect transitions. An insufficient, unsafe, interrupted or active-encounter rest is withheld before narration; no entry, supply charge or healing is partially committed. Optional rejection is visible to the public-safe narrator, which cannot claim rejected recovery.

The DM may pin a suitability judgment for the current known Location and this operation. Only a resolver clone receives this temporary safety permission. Persisted `safeLocationIds` are preserved. The private pin includes campaign, operation and original created-timeline provenance, and SQL independently validates it. Restored pending turns retain that immutable judgment while the current save/timeline fence still governs claim and commit. Lodging dialogue alone remains Scene/Memory fiction.

## Ordered authority

Each accepted effect resolves against a cloned shadow after the previous accepted effects and validated base result. An optional failure discards its local candidate. Changes collapse by family/ID with original source revisions retained, including NULL for newly created rows. No database row changes until the single fenced turn commit. The existing resolver now preserves a newly created row's NULL revision when a later action in the same plan updates it.

Reward→purchase, job completion→reward, sale→purchase, transfer→consumption, recipe preparation/serving→rest, resource deltas and currency-definition→progression compose without last-write-wins authority. The merged mechanics Foundation state preserves frozen World/topology/Actors/Events and authored progression definitions. Stable creation-ID collisions are omitted; they cannot create a second copy.

Migration `supabase/migrations/202610080048_astra_ordered_mechanics.sql` adds one nullable private turn field, `astra_ordered_effects`. Independent SQL reconstruction verifies the pinned intents, source rows, exact changes, bounds, safety and final Foundation mechanics state. Existing Migration-38 and subsequent commit guards validate the unchanged raw Astra base final. Only exact pinned base writes from the active lease are temporarily deferred; the independently reconstructed collapsed result is then applied once through existing `runtime_change`. Narration, state, private patches, jobs, mechanics and the final autosave share one SQL transaction.

For a successfully claimed retryable failed schema-2 turn, Migration 48 starts a new generating attempt and clears only the attempt diagnostic/failure flags. This fixes the reproduced cached-narration retry obstruction without changing pinned effects or legacy/schema-1 claim behavior.

## Compatibility and privacy

Migration 47 is unchanged. Pre-47 saves, historical single settlements, schema-1 effect receipts, immutable manifests, pending schema-2 saves and restored retries retain their authority. No takeover, World authoring or owner campaign is modified. Private effects, safety pins, source records and SQL helpers remain outside public DTOs. The narrator sees accepted public outcomes and server-derived after-values, not private planning data.

Shared exact enum definitions reduce repeated provider schema lists. A 160-Item test stays within the documented Structured Outputs limits while retaining the same exact eligible IDs. This is schema compatibility work, not a change to model, provider or narrative authority.

## Verification

The focused cross-system batch passed **183/183**. The rest/ordered/recovery subset passed **35/35**, the real-provider contract tests **4/4**, and the offline smoke/forensic tests **5/5**; these counts overlap the focused and complete suite. The complete suite passed **2,196/2,197**, zero failures, with the existing explicit-opt-in disposable Supabase Auth/PostgREST test skipped. TypeScript, repository ESLint with zero warnings and the final production webpack build passed. The full suite used an isolated unconfigured preview on port 3017, which was stopped afterward; the owner app was not restarted.

The live disposable harness allows at most three Game turns/eight text requests; Astra High plans and Astra Medium narrates at default tier. It retains sanitized synthetic responses, parsed decisions, ordered provider/store boundaries, SQL rejection details and private disposable checkpoint summary. A transport/capture failure reports unknown usage/spend and stops further requests. It never dispatches media or connects to an owner database.

## Live result — stopped after one committed compound turn

Exact retained evidence: [ASTRA_FREEDOM_LIVE_SMOKE_DATA.json](ASTRA_FREEDOM_LIVE_SMOKE_DATA.json). The artifact is unchanged synthetic output; its overall `status=failed` records a post-commit harness assertion, not a rejected gameplay turn.

Two real text requests completed with HTTP 200: High planner and Medium narrator, `gpt-6-astra`, default tier. Operation `6f621344-0287-4e55-8787-3f79e4b4b8b1` committed after parse, final checkpoint, narration checkpoint and SQL commit. SQL error arrays are empty. There was no provider/schema/routing/billing rejection.

The exact plan selected `job_complete`, `job_reward` and `formal_rest` (long, current known Location suitable). It did **not** select a new tomorrow job. The bartender's public answer offered cellar work with terms still to settle. That is not evidence of an accepted new commitment, and was not manufactured into a Quest.

| Disposable state | Before | After committed A |
| --- | ---: | ---: |
| Silver | 0 | 2 |
| Vegetables Item count | 0 | 1 |
| Completed jobs | 0 | 1 |
| Open jobs | 1 | 0 |
| HP | 4/12 | 10/12 |
| Tagged travel rations | 3 | 2 |
| World minutes | 0 | 480 |
| Completed rests | 0 | 1 |
| Persistent safe Location IDs | empty | empty |

Thus the live compound turn also exercised formal rest through the existing deterministic profile: six HP recovery, one supply and 480 minutes. No narration-authored healing was applied. Current Location was unchanged. However, the model interpreted “let me sleep in the loft” as completing sleep, whereas the harness intended A as permission-only and B as the separate rest turn. This divergence is retained, not repaired or retried.

The first failed assertion was `tomorrow's agreed job is recorded`. Later A assertions, exact replay and live save/load were not reached. Standalone live B and absurd-improvisation C were **not run**. Offline tests prove these mechanical/replay/save paths, but they do not substitute for the remaining live acceptance evidence. The complete three-turn live protocol therefore **has not passed**.

Usage: **2 requests**, **15,692 input / 1,141 output tokens**, **0 cached / 516 reasoning tokens**, estimated **US $0.2140** using the existing conservative $10/$50-per-million accounting (cached discount not used). Provider latency was **28.038 s** planning plus **12.921 s** narration, **40.959 s** total. One completed turn is insufficient for a meaningful per-turn p50/p95. Media calls: **0**. No further real request, retry or production repair followed the stop.

Next live evaluation requires owner authorization and a reviewed harness distinction between an inquiry/offer and an accepted job, and between lodging permission and explicit completed rest. The architecture must not force casual offers into Quests to satisfy an overstrict test.

## Genuine limits

- Check-bearing mechanic choices are not added to this adapter; established Astra deterministic tools remain their authority.
- Provider action IDs are drawn from current authoritative records. An Item freshly minted within a final cannot be named by a model-owned invented ID for a later effect; existing recorded Item receipt→use/transfer works, and deterministic server tests cover generated-record composition.
- Repeated operation-derived creation identities are safely omitted rather than generating a second identity. No new semantic output-reference DSL was introduced.
- Generic mechanical Item transfer is limited to controlled or unowned storage. NPC commerce continues through the existing bounded settlement authority; linked transport storage outside that adapter selection remains a narrower compatibility case.
- Bundles retain six effects, six mechanic actions per effect, at most 100 collapsed rows and at most 1,440 minutes of advancement. Long journeys remain multiple turns.
- The two historical Iris failures remain unchanged. Their missing historical provider rejection is still unknown; this work does not infer a cause retroactively.

## Owner activation requirements

Separate owner approval is required for this candidate and migrations **47 → 48**, in that order. Activation must verify exact main/candidate ancestry, owner migration level 46, a fresh verified backup, no unsafe in-flight operation, existing gameplay fingerprints, then apply each exact migration with an atomic receipt and repeat integrity checks. Existing Iris operations must not be retried or repaired as part of activation. Code integration, local restart and zero-provider read-only readiness smoke follow only after database checks. No activation has occurred in this closure.
