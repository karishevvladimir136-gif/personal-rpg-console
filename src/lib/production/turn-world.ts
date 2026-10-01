import { isDeepStrictEqual } from "node:util";
import { mergeConsequenceChanges } from "../world/consequences.ts";
import type { RecordChange } from "../gameplay/server-contracts.ts";
import { readWorldFoundation } from "../server/world/store.ts";
import { stageWorldTransition } from "../world/stage.ts";
import { parseWorldState } from "../world/validation.ts";
import {
  stageResolvedWorldTransition,
  type ResolverProposal,
  type ResolverStageResult,
} from "../world/resolver.ts";
import {
  resolveWorldLogic,
  type WorldLogicInput,
  type WorldLogicProposal,
} from "../rulesets/world-logic.ts";
import { validateRecomputedContinuation } from "../production-adapters/world-recovery.ts";
import { TurnError } from "../gameplay/turn-errors.ts";
import type { FoundationRpc, WorldSettlement } from "./contracts.ts";
import type { PrepareWorld, PrepareWorldLogic } from "./turn-contract.ts";
import type { WorldStageInput } from "../world/contracts.ts";
import type {
  ProviderResult,
  ProviderUsage,
  TurnClaim,
} from "../gameplay/server-contracts.ts";
import type { JsonObject } from "../gameplay/contracts.ts";

export type WorldTurnOptions = {
  action?: (
    input: WorldLogicInput,
  ) => Promise<
    ProviderResult<
      WorldLogicProposal & { foundationAction?: JsonObject | null }
    >
  >;
  resolve?: (
    input: WorldStageInput,
  ) => Promise<{ result: ResolverStageResult; usage: ProviderUsage | null }>;
};

async function authority(rpc: FoundationRpc, claim: TurnClaim) {
  const timeline = claim.lease.timeline;
  if (!timeline) throw new TurnError("conflict");
  const { input } = claim.turn;
  const snapshot = await readWorldFoundation(
    rpc,
    claim.source.ownerId,
    input.campaignId,
    timeline,
  );
  const command = {
    operationId: input.operationId,
    campaignId: input.campaignId,
    timeline,
    expectedRevision: snapshot.revision,
    expectedRuntimeRevision: claim.lease.expectedRevision,
    expectedHeadId: snapshot.headId,
  };
  return { snapshot, command, source: claim.source, input };
}

/** One typed action proposal, checkpointed before settlement or narration. */
export function worldLogicTurnPreparer(
  rpc: FoundationRpc,
  options: WorldTurnOptions = {},
): PrepareWorldLogic {
  return async (claim, previous) => {
    const input = await authority(rpc, claim);
    if (input.snapshot.ruleset.id === "console-basic-v1") return null;
    if (
      input.snapshot.ruleset.id !== "world-logic-v1" ||
      claim.turn.input.mode !== "game"
    )
      throw new TurnError("configuration");
    let foundationAction: JsonObject | null | undefined;
    let proposal: unknown = previous,
      usage: ProviderUsage | null = null;
    if (!proposal) {
      if (!options.action) throw new TurnError("configuration");
      const response = await options.action(input);
      const { foundationAction: action, ...base } = response.output;
      foundationAction = action;
      proposal = base;
      usage = response.usage;
    }
    const result = resolveWorldLogic(input, proposal);
    const world = parseWorldState(
      input.snapshot.world,
      input.snapshot.campaignId,
    );
    return {
      proposal: proposal as JsonObject,
      ...(foundationAction !== undefined ? { foundationAction } : {}),
      resolution:
        result.status === "staged" || result.status === "mundane"
          ? result.resolution
          : null,
      usage,
      presence: {
        controlledEntityIds: world.actors
          .filter((a) => a.control === "player" && a.entityId !== null)
          .map((a) => a.entityId!),
        presentEntityIds: world.actors
          .filter(
            (a) =>
              a.publicName !== null &&
              a.entityId !== null &&
              input.source.snapshot.publicState.current_location_id !== null &&
              a.locationId ===
                input.source.snapshot.publicState.current_location_id,
          )
          .map((a) => a.entityId!),
      },
    };
  };
}

function resolverProposal(previous: WorldSettlement): ResolverProposal {
  return {
    schemaVersion: 1,
    decisions: previous.events.flatMap((event) => {
      const receipt = event.payload.resolverReceipt;
      if (!receipt || typeof receipt !== "object" || Array.isArray(receipt))
        return [];
      const {
        schemaVersion: _schema,
        operationId: _operation,
        ...decision
      } = receipt;
      void _schema;
      void _operation;
      return [decision as ResolverProposal["decisions"][number]];
    }),
  };
}

function withoutPriorResolverChanges(
  changes: RecordChange[],
  previous: WorldSettlement,
): RecordChange[] {
  const result = structuredClone(changes);
  for (const event of previous.events) {
    if (event.kind !== "world.thread.advanced") continue;
    const authority = event.payload.consequenceAuthority;
    if (!Array.isArray(authority)) continue;
    for (const raw of authority) {
      if (
        !raw ||
        typeof raw !== "object" ||
        Array.isArray(raw) ||
        raw.family === "world.actors"
      )
        continue;
      const change = result.find(
        (r) => r.family === raw.family && r.id === raw.id,
      );
      if (
        !change ||
        !raw.after ||
        typeof raw.after !== "object" ||
        Array.isArray(raw.after)
      )
        throw new TurnError("conflict");
      for (const [field, value] of Object.entries(raw.after)) {
        if (
          change.expectedRevision !== raw.expectedRevision ||
          !isDeepStrictEqual(change.values[field], value)
        )
          throw new TurnError("conflict");
        delete change.values[field];
      }
    }
  }
  return result.filter((r) => Object.keys(r.values).length > 0);
}

/** The only world/turn bridge. No private state is added to RuntimeSource. */
function prepareWorldUnsafe(
  rpc: FoundationRpc,
  options: WorldTurnOptions,
): PrepareWorld {
  return async (claim, resolution, previous) => {
    const input = await authority(rpc, claim);
    const { snapshot, command } = input;
    const action = claim.turn.checkpoint.worldLogic
      ? resolveWorldLogic(input, claim.turn.checkpoint.worldLogic)
      : null;
    const usage: ProviderUsage[] = [];
    const base = {
      ...resolution,
      changes:
        previous && !action
          ? withoutPriorResolverChanges(resolution.changes, previous)
          : resolution.changes,
      outcomes: resolution.outcomes.filter(
        (row) => row.kind !== "world.observed",
      ),
    };
    const stageInput: WorldStageInput = {
      snapshot,
      command,
      source: claim.source,
      resolution: base,
      trigger:
        base.worldMinutes > snapshot.worldMinutes
          ? "time_skip"
          : base.changes.length
            ? "state_change"
            : "action",
    };
    if (claim.turn.checkpoint.worldLogic?.schemaVersion === 3) {
      const mundane = resolveWorldLogic(
        input,
        claim.turn.checkpoint.worldLogic,
      );
      if (
        previous ||
        mundane.status !== "mundane" ||
        !isDeepStrictEqual(mundane.resolution, base) ||
        stageWorldTransition(stageInput).status !== "noop"
      )
        throw new TurnError("validation");
      return null;
    }
    if (
      action &&
      (action.status !== "staged" ||
        !isDeepStrictEqual(action.resolution, base))
    )
      throw new TurnError("validation");
    let result: ResolverStageResult = stageWorldTransition(stageInput);
    if (result.status === "paused" && result.reason === "resolver_required") {
      if (previous)
        result = stageResolvedWorldTransition(
          stageInput,
          resolverProposal(previous),
        );
      else {
        if (!options.resolve) throw new TurnError("configuration");
        const response = await options.resolve(stageInput);
        result = response.result;
        if (response.usage) usage.push(response.usage);
      }
    }
    if (result.status === "paused") throw new TurnError("configuration", false);
    let settlement = result.status === "staged" ? result.settlement : null;
    const publicEvents =
      result.status === "staged" ? [...result.publicEvents] : [];
    if (action?.status === "staged") {
      publicEvents.unshift(...action.publicEvents);
      const originalActors = snapshot.world?.actors;
      const actionActors = action.settlement.nextWorld.actors;
      const resolverActors = settlement?.nextWorld.actors;
      let actors = actionActors;
      if (settlement) {
        if (
          !Array.isArray(originalActors) ||
          !Array.isArray(actionActors) ||
          !Array.isArray(resolverActors) ||
          originalActors.length !== actionActors.length ||
          originalActors.length !== resolverActors.length
        )
          throw new TurnError("validation");
        actors = originalActors.map((original, index) => {
          const actionActor = actionActors[index],
            resolverActor = resolverActors[index];
          const byAction = !isDeepStrictEqual(original, actionActor),
            byResolver = !isDeepStrictEqual(original, resolverActor);
          if (byAction && byResolver)
            throw new TurnError("configuration", false);
          return byAction ? actionActor : resolverActor;
        });
      }
      settlement = settlement
        ? {
            ...settlement,
            events: [...action.settlement.events, ...settlement.events],
            nextWorld: {
              ...settlement.nextWorld,
              actors,
            },
          }
        : action.settlement;
    }
    if (!settlement) {
      if (previous) throw new TurnError("conflict");
      return null;
    }
    if (settlement.events.length > 8) throw new TurnError("configuration");
    const saved = await rpc({
      p_owner_id: claim.source.ownerId,
      p_campaign_id: command.campaignId,
      p_action: previous ? "recover" : "stage",
      p_payload: previous
        ? { command, token: claim.lease.token }
        : { command, settlement },
      p_timeline: command.timeline,
    });
    if (saved.error)
      throw new TurnError(
        saved.error.message?.match(/rpg_conflict|rpg_recovery_required/)
          ? "conflict"
          : "validation",
      );
    if (previous)
      settlement = validateRecomputedContinuation(
        previous,
        settlement,
        saved.data,
      );
    else if (!isDeepStrictEqual(saved.data, settlement))
      throw new TurnError("validation");
    return {
      settlement,
      usage,
      resolution: {
        ...base,
        changes: mergeConsequenceChanges(
          base.changes,
          result.status === "staged" ? (result.consequenceChanges ?? []) : [],
        ),
        outcomes: [
          ...base.outcomes,
          ...publicEvents.map((event) => ({
            kind: "world.observed",
            text: event.text,
            itemIds: [],
            entityIds: event.actorIds.flatMap((id) => {
              const world = snapshot.world as {
                actors?: { id: string; entityId: string | null }[];
              } | null;
              const entity = world?.actors?.find(
                (row) => row.id === id,
              )?.entityId;
              return entity ? [entity] : [];
            }),
          })),
        ],
      },
    };
  };
}

/** Safe runtime categories only; private validation causes never escape. */
export function worldTurnPreparer(
  rpc: FoundationRpc,
  options: WorldTurnOptions = {},
): PrepareWorld {
  const prepare = prepareWorldUnsafe(rpc, options);
  return async (...args) => {
    try {
      return await prepare(...args);
    } catch (error) {
      if (error && typeof error === "object" && "code" in error) {
        if (error.code === "stale_world" || error.code === "conflict")
          throw new TurnError("conflict");
        if (error.code === "invalid_world" || error.code === "scope")
          throw new TurnError("validation");
      }
      throw error;
    }
  };
}
