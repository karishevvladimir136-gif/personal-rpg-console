# World Engine Wave 1 server seam

This is a bounded deterministic foundation, not a semantic resolver or a background simulator. The typed JSON is in `contracts.ts`; `parseWorldState(value, campaignId)` rejects unknown fields, invalid scopes/references, malformed evidence, duplicate identities and cyclic prerequisites. It returns a detached validated copy.

## Integration

Import the pure `stageWorldTransition` from `src/lib/world/index.ts` only in server-owned gameplay orchestration, after `resolveMechanics`:

```ts
stageWorldTransition({
  snapshot, // authoritative FoundationSnapshot from rpg_world
  command, // initiating operation, exact timeline/epoch, world/runtime revisions and head
  source, // the same authorized RuntimeSource used for mechanics
  resolution, // proposed MechanicsResolution; it has not been committed
  trigger, // action, travel, rest, time_skip, state_change, session_boundary or none
});
```

The result is `noop`, `paused` with a safe reason enum, or `staged` with the shared `WorldSettlement` and separately allowlisted `publicEvents`. Every result has `modelRequests: 0`. Feedback/OOC, refresh, polling and save/load map to `none`. A session boundary evaluates already-due work at the unchanged minute. An ordinary action needs mechanical changes or elapsed fictional time.

Persist a staged result in the existing pending turn and world-stage record. Narration may receive only `publicEvents`. Atomically commit the original player mechanics, nextWorld, immutable events and operation receipt under the initiating fence; failure commits neither side. The caller must never commit player costs/time when this function pauses. `validateWorldSettlement(input, proposed)` deterministically recomputes the proposal and requires exact equality on resume, so stale revisions/fences/heads/source versions or edited outcomes fail. The existing turn receipt must additionally bind the original request; the shared settlement intentionally does not duplicate the input/dice ledger. A save restore must re-stage under the newly authorized fence or return conflict, never blindly rewrite an old settlement's fence.

`readWorldFoundation(rpc, ownerId, campaignId, timeline)` in `src/lib/server/world/store.ts` is a pure injected adapter for the Lead's service-only `rpg_world` RPC. The injection must already carry authorized server credentials; this adapter neither creates credentials nor exposes a public route. Read and unconfigured/no-op paths perform no writes. A legacy `world: null` stays null.

## Domain and boundaries

Actors reuse existing entity IDs for entity-backed identities; groups, factions and locations are neutral identities. They contain control/capability/knowledge references, never HP, inventory or a second character record. Thread participants and decision makers are distinct: a PC can be affected without the engine deciding for that PC. Explicit player control, legacy player-kind entities and both current/proposed mechanics control lists are protected.

Threads hold at most eight authored steps with deadline/autonomy/causal triggers. A causal trigger means a trusted MechanicsResolution contains an actual change to the configured record family and ID. Its matching is deliberately coarse; arbitrary conditions, computed mechanics, new world authoring and contextual consequences require a separately validated future extension. Only explicitly approved deterministic thread and hook transitions execute. Resolver-required steps pause.

Simulation, autonomy and deadline pressure are independent. Simulation Off suppresses timed work; direct initiated causal changes can still resolve. Deadline Off suppresses time-driven expiry/completion; Critical Only permits established scenario-critical deadlines. Nonterminal background autonomy can progress without expiring hooks or completing a thread when deadlines are suppressed. Low/Moderate/High constrain autonomous relevance and cap touched threads/actors at 3/8, 8/16 and 12/24. Every segment caps all events at eight. Work overflow returns one pause and no partial proposal, including mandatory deadline and dependency work. No wall-clock or provider code exists here.

Policy changes are prospective. `reconcileWorldPolicy(current, nextPolicy, authoritativeWorldMinutes, [{stepId, atWorldMinutes}])` requires an explicit future time for exactly every overdue newly enabled timed step. It never executes or fabricates catch-up. The caller must supply the authoritative current time and persist through the Lead's owner-authorized configure command.

Warnings are created only by a committed step that produces an independent public warning event and names player recipients. A completion requiring prior warning checks the original snapshot's receipt and opportunity boundary; a warning proposed in the same settlement cannot count as an opportunity to respond. Configuration must preserve existing warning receipts exactly; SQL must forbid fabricated/rewritten receipts. An oversized skip crossing a new warning and its completion pauses; the owner can approve a shorter coherent interval that commits the warning. This slice does not add a Continue Simulation UI or automatic multi-segment runner.

Latent hooks retain private premises and stable IDs. Discovery is an explicitly authored knowledge projection, not automatic public knowledge from simulation. Thread steps may resolve/expire associated hooks, retaining identity/history. `projectPublicWorld` intentionally exposes no private counts, actor knowledge, current hidden progress/status or hook expiry; a previously known rumor remains a rumor until a separate public event discloses a change.

## Event validation expected in SQL

A step always emits private `world.thread.advanced` with payload `{schemaVersion:1, stepId, previousCursor, nextCursor, hookChanges:[{hookId,status}]}`. Its actor/thread membership is private. An optional separate `world.observed` event has empty payload, independently validated public text/evidence/known actor references, and no private thread reference. Public evidence requires visibility public and character knowledge; source-only and future-source evidence cannot justify current consequences. Decision makers require the cited current evidence in their own knowledge.

Event IDs derive from the existing `stableGameplayId(operationId, "world-v1:" + threadId + ":" + stepId + ":private|public")` helper. SQL assigns sequence only on commit. Enforce immutable identities/actor rows/policy under settlement, monotonic bounded thread progression, matching step/hook/warning effects, all owner/campaign/source/fence checks and service-only dispatch independently. This worker owns no migrations, atomic commit hook or save-manifest code.

Verified with synthetic offline tests, TypeScript, ESLint and a production webpack build. These are implementation checks; they do not establish model quality, live Auth acceptance, browser acceptance or owner approval.
