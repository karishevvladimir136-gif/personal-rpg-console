# Astra-primary takeover of a World Logic campaign — implementation candidate

**Status:** isolated review candidate. Migration 39 has been applied only to disposable databases. The owner campaign, its round-11 encounter, the real owner database, the running owner app, `main`, and deployment have not been changed. No provider call was needed.

## Authority boundary

Migration `202610060039_astra_world_logic_takeover.sql` adds one nullable private `astra_takeover` value to the existing `rpg_private.world_foundations` row. It contains the server-owned request identity, campaign, originating playable timeline and epoch, exact runtime/public/World revisions, World digest/event head, head manifest, world time, creation time and pre-takeover safety-save ID. The row is already captured by playable saves and timeline manifests. A null field in an old immutable manifest means legacy World Logic. No existing turn, manifest, World Actor, World Event, or ruleset ID is rewritten.

The explicit service-role `rpg_runtime` action `astra_takeover` acquires the campaign lock, checks owner registration, the current playable timeline/fence/head and all supplied revisions/digest/event sequence, then checks a clean gameplay boundary and matching overlapping live state. It rejects an active encounter, unresolved encounter action, planned rest, pending/generating/awaiting or retryable failed turn, active lease, uncommitted World stage, active thread/hook/warning or pending World work. It also checks the controlled protagonist, public versus World Location, present actors, known actor Location references, current public session/scene, HP and Item bounds. A single transaction creates the before save, writes the marker, and creates the after save. An identical request is idempotent; an altered or stale request conflicts.

The **current owner campaign has an active round-11 encounter**, so this operation must reject it. The encounter must reach a legitimate clean boundary through ordinary owner play before any separate owner activation approval. This implementation never ends or alters it.

## Ordinary play after handoff

With `RPG_ASTRA_PRIMARY_P1=1` and the marker present on the current playable timeline, a **new** `mode=game` operation selects `astra-primary-v1`. Its literal input and runtime identity are pinned together at durable `begin`. Existing operations retain their stored runtime identity. The old World Logic resolver does not run before or after Astra. Turning the flag off after handoff fails closed for a new Game begin; it does not silently return to World Logic.

Astra receives a bounded private packet from the exact saved source: current/present World Actors with capabilities, limitations and bounded knowledge, relevant authorized route IDs, World policy and a small set of relevant World Events. Current public/runtime state, Canon and owner corrections have higher authority for overlapping live facts. The public narration source removes this packet and other DM-private material. The packet and marker are never returned in the Game/PublicTurn, World read or save-list DTOs.

Writable state remains P1's existing generic authority: current-public query; server skill, attack, save and damage tools; bounded HP/resource/Item changes; known Location travel; and encounter participant state where supported. The model cannot write configuration. Travel requires an authorized existing World route or local-route rule and positive world-time advancement. The server deterministically reduces live `presentEntityIds` to the controlled protagonist on travel so an old World Actor Location cannot masquerade as live presence. Migration 38's final-proposal, tool-receipt, revision and atomic commit checks remain in force; the one configuration guard amendment requires that exact server-derived presence projection for takeover travel. The World/public table is not dual-written by model prose.

After handoff, standard public/runtime tables own ordinary-play Location, HP, resources, Items, equipment, encounters and time. World Foundation and World Events remain historical/reference records. The legacy World write RPC and direct changes to the historical World data are rejected while the marker is active. A live World read projects only the **controlled Actor's Location** from current public state and increments that Actor's revision in the projection if Location differs; it does not edit the stored Actor or World Event. Other World Actors retain their historical/reference locations. No second AI synchronization pass or semantic action schema is introduced.

## Saves, rollback and World Lab

The marker travels with the existing versioned World Foundation row in every post-takeover playable save. Loading or forking from a pre-takeover save restores null marker and legacy routing; loading or forking from a post-takeover save restores the marker and Astra routing. Timeline restore may replace the full row under its existing restore guard. The pre/post safety saves are created in the same activation transaction. Historical immutable manifests are untouched.

World Lab and What-If remain detached. A pre-takeover saved base uses the old World data unchanged. A post-takeover saved base reads its **saved** public Location and controlled entity, projects that Location and, only if changed, the controlled Actor's revision into a new detached version of the Foundation. The playable source save, original Foundation version, World Events and existing detached runs remain untouched. Simulation writes cannot become playable authority.

## Verification and boundaries

Disposable tests cover a populated 38→39 upgrade with unchanged RPG row fingerprints, old-save restoration, exact request fencing, cross-campaign rejection, unfinished-turn blockers, public/World Location mismatch, an owner-shaped round-11 rejection with no changed gameplay rows, a legitimate legacy encounter end followed by successful takeover, pre/post save rollback/forks, fake-provider Astra travel and query, historical World write rejection, private DTO redaction and post-save World Lab projection. Migration 35–38, Astra-primary, Saves/Timelines and World Lab regressions are rerun separately. Full suite, TypeScript, zero-warning lint and production build results are recorded in `DEV_STATUS.md`.

Known limits are intentional P1 limits: Astra cannot create arbitrary new World Actors, routes or structural World facts; autonomous Actor relocation is not a generic writable capability; after travel, actors at the destination are not assumed present solely from their historical World Location. World Lab projects only the controlled Actor's Location because that is the overlapping standard public field with a current authoritative value. Existing Memory and Canon remain their own systems. No owner-facing UI was added.

## Procedure for a separately approved owner activation

1. Let the owner finish the active encounter and any unfinished actions through normal play. Do not end, cancel or retry them administratively.
2. Back up the real database and verify that backup, then apply **only** reviewed Migration 39 under separate owner approval. Recheck campaigns, saves, Memory, legacy turns and the encounter state.
3. At a clean boundary, read the active playable fence/head, runtime/public/World revisions, exact World digest and World Event sequence. Invoke the private service-role `astra_takeover` action with those exact values and a fresh server-generated request ID. A stale value must conflict. Retain the returned named before/after safety-save IDs.
4. Verify the marker is active only on the intended playable timeline, both saves are readable, new Game begins would pin Astra, and old saved turns remain legacy. Then enable the local app flag and restart under separate approval. The owner types the first real action.

The product principle remains: **Power may grow, but meaning must grow faster.** The DM should build significance from relationships, familiar places, consequences, promises, failures and changing people rather than automatic increases in player importance.
