# Astra primary DM production P1 candidate

**Status: P1 CANDIDATE — LIVE SMOKE FAILED, DIAGNOSIS PENDING.** This isolated, opt-in candidate is frozen for review. It is not accepted or complete, and it has not been activated on the owner app, owner database, or `main`.

## Architecture and routing

New `game` turns in a `console-basic-v1` campaign may opt in through the server-only `RPG_ASTRA_PRIMARY_P1=1` flag. The normal Game input and `/turns` API remain unchanged. The server checks a pre-existing turn's private runtime identity before choosing a path. A pinned `astra-primary-v1` turn always resumes through Astra; a null identity is legacy, including historical turns and old saved pending turns. World Logic, OOC/feedback, What-If and other routes remain on their established code.

The new path is: durable literal input and runtime pin at `begin` → existing curated Memory/Canon/state/Craft context → one Astra DM (`gpt-6-astra`, high reasoning) with generic server tools → pinned final state proposal → public/outcome-safe Astra narration → existing `TurnStore` atomic commit. There is no ShadowJournal, second memory store, NPC agent, or action-specific language schema. The old runtime remains available and is delegated unchanged for legacy turns.

## Migration 38

`supabase/migrations/202610060038_astra_primary_runtime.sql` adds one nullable private turn identity. The null value means legacy so immutable pre-38 save payloads remain restorable. The same private `begin` transaction that saves the literal input pins `astra-primary-v1`; a retry with a different input or identity conflicts. The migration keeps the complete effective post-37 runtime as a delegated legacy entry point. It makes the existing save timeline stamping treat `astraPrimary` as an opaque checkpoint authority, preserving its creation fence and receipts through a save, load, fork, and resume.

The private Astra checkpoint stores a bounded schema version, original timeline, ordered receipts, and one final proposal. The existing service-role `rpg_runtime` RPC gains narrow Astra branches; authenticated/browser roles receive no new private access. No public gameplay table, new save authority, or owner-data backfill is added. The migration is applied only to disposable in-memory databases during verification.

## Tool receipts and final authority

Only `query current-public`, `skill`, `attack`, `save`, and `damage` are accepted. The server owns the tool position, receipt ID, dice, modifiers, attack defense, and bounded damage die from current authoritative rules and equipment. The private receipt list is append-only. An identical call at an already recorded position returns that receipt; a changed call conflicts. Damage has its own receipt, separate from visible d20 Checks. Player-visible skill/attack/save Checks use the existing dice presentation and reroll command authority; reroll changes the Check result without minting another tool receipt. On resume, the current recorded Check controls hit/damage permission.

The private final proposal is pinned before narration or commit. It names the exact campaign, operation, source revision, literal input, ordered non-query receipt references, state changes, and private patches. A different final conflicts. Migration 38 checks exact packet equality against that pin; verifies scope, fence, revisions, receipt references, damage-backed HP, current item/resource bounds, known campaign Location and time, and active encounter Action/Move/withdrawn changes; then delegates to the existing runtime change and commit validators. Legacy natural-action, combat-exchange and natural-combat-turn checkpoints and their post-37 guards remain unchanged. A rejected commit is atomic.

## Privacy and Console context

Private planning may use authorized DM-private state and private Memory. The narration call receives a new public projection, public Memory, validated outcomes, and public Check results. It receives neither raw private state nor private Character Model fields, private Memory, hidden clocks, or the raw final proposal. The existing `publicSource`, `characterPacket`, Memory retrieval, correction precedence, pinned DM Craft selector and Campaign DM Style are reused. Existing Craft selection allows zero, one, or two relevant optional cards per stage. This P1 does not enlarge the accepted context budget.

Power may grow, but meaning must grow faster. The compact DM guidance emphasizes relationships, familiar places, promises, consequences, failure, changing NPCs, and unresolved threads rather than automatic importance or reward escalation. There is no special anti-Mary-Sue mechanics system.

## Offline verification

- Complete migration chain through 38 on an empty disposable database and populated 37→38 upgrade: **4/4 focused disposable-database migration tests passed**. Old saves and legacy pending turns remained on legacy authority in those tests.
- Production Astra P1 plus migrations 35–37 focused tests: **58/58 passed**, including the synthetic eight-turn Mechanical Acceptance V2 trajectory.
- Twenty-four turn scripted fake-provider soak: **passed**. Twenty-three turns committed; one invalid state proposal was rejected with no partial commit. It covered public-state query, dialogue, travel/return, inventory consumption, resource spend, checks, attack/damage/HP loss, refusal, a wrong theory, quiet scene, old callback, retry and replay. Exact final state was asserted.
- Full repository suite: **1,927 passed / 1,928 total**, zero failures and one existing skip. TypeScript passed, ESLint passed with zero warnings, and the production webpack build passed.

## First synthetic live smoke — stopped

The first production-path synthetic turn made exactly **one** direct `gpt-6-astra` request at high reasoning. The provider response used **3,562 input tokens**, **1,079 output tokens**, and **21.361 seconds**; estimated spend was **US $0.0896**. The turn failed after that response and before narration. There was no retry, later turn, or additional provider call.

The smoke harness did not preserve the exact structured proposal or the exact rejection boundary. The rejecting validator is therefore **unknown**. No technical cause is inferred from the missing evidence. The candidate remains frozen at this failed-smoke review point; diagnosis and any repair require separate owner authorization. The smoke used disposable synthetic data only.

## Known P1 limits

- The opt-in is off by default. No existing turn changes runtime when the flag or current configuration changes.
- The generic writable set is deliberately bounded: damage-backed HP, an existing actor's resource decrease, exact Item quantity decrease, travel to a known Location with time advancement, and active encounter position/Action/Move/defeat changes. Ordinary exploration inside one Location stays narrative rather than fake tactical movement. Existing Inventory, progression, commerce, loot, rest, and World Logic authorities remain available on the legacy path; P1 does not add adapters for all of their operations to Astra-primary yet.
- Existing Character Models can inform the private DM and public voice projection, but this first path does not author a `character_<id>` model patch; that existing model update guard requires a compatible pinned legacy plan. Ordinary bounded DM-private fact/clock/NPC patches still use current private authority.
- The deterministic fake-provider tests establish state and recovery safety, not the quality of a live DM response. The failed first live smoke leaves production-path acceptance unresolved. The owner must review the frozen candidate before any diagnosis, repair, real database migration, or activation.

## Files changed

Migration 38; the Astra runtime and OpenAI provider adapter; the existing TurnStore, server contracts, gameplay service and production service routing; production-focused migration, runtime, adapter, eight-turn acceptance and 24-turn soak tests; this report and `DEV_STATUS.md`.
