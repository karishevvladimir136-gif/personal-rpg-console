import { isDeepStrictEqual } from "node:util";
import type { JsonObject } from "../gameplay/contracts.ts";
import type { TurnClaim, RecordChange } from "../gameplay/server-contracts.ts";
import type {
  FoundationCommand,
  FoundationRpc,
} from "../production/contracts.ts";
import type { LoopContext, LoopPlan } from "./contracts.ts";
import { readFoundationLoop, loopCommand } from "./authority.ts";
import { parseWorldState } from "../world/validation.ts";
import {
  planFoundationAction,
  parseFoundationActionProposal,
} from "../foundation-actions/index.ts";
import { TurnError } from "../gameplay/turn-errors.ts";

export type FoundationTurnSettlement = {
  schemaVersion: 1;
  command: FoundationCommand;
  proposal: JsonObject;
  worldMinutes: number;
  plan: LoopPlan;
};
export type PrepareFoundation = (
  claim: TurnClaim,
) => Promise<FoundationTurnSettlement | null>;

function afterChanges(
  context: LoopContext,
  changes: RecordChange[],
): LoopContext {
  const result = structuredClone(context);
  for (const change of changes) {
    if (change.family === "public_state") {
      Object.assign(result.snapshot.publicState, change.values, {
        revision: result.snapshot.publicState.revision + 1,
      });
      continue;
    }
    if (
      !["entities", "items", "storages", "locations", "quests"].includes(
        change.family,
      )
    )
      continue;
    const rows = result.snapshot[
      change.family as
        "entities" | "items" | "storages" | "locations" | "quests"
    ] as unknown as Record<string, unknown>[];
    const old = rows.find((r) => r.id === change.id);
    const next = {
      ...old,
      ...change.values,
      id: change.id,
      campaign_id: result.foundation.campaignId,
      revision: (Number(old?.revision) || 0) + 1,
    };
    if (old) Object.assign(old, next);
    else rows.push(next);
  }
  return result;
}

/** Same normal turn/checkpoint/World Event authority, after ordinary resolution. */
export function foundationTurnPreparer(rpc: FoundationRpc): PrepareFoundation {
  return async (claim) => {
    const { checkpoint, input } = claim.turn;
    const raw =
      checkpoint.foundationAction ?? checkpoint.plan?.foundationAction;
    if (!raw) return null;
    if (
      input.mode !== "game" ||
      !claim.lease.timeline ||
      !checkpoint.resolution
    )
      throw new TurnError("validation");
    const initial = await readFoundationLoop(
      rpc,
      claim.source.ownerId,
      input.campaignId,
      claim.lease.timeline,
    );
    if (!isDeepStrictEqual(input.timeline, claim.lease.timeline))
      throw new TurnError("conflict");
    const command = loopCommand(initial, input.operationId);
    if (command.expectedRuntimeRevision !== claim.lease.expectedRevision)
      throw new TurnError("conflict");
    const context = afterChanges(initial, checkpoint.resolution.changes);
    context.foundation.worldMinutes = checkpoint.resolution.worldMinutes;
    if (checkpoint.worldSettlement) {
      context.world = parseWorldState(
        checkpoint.worldSettlement.nextWorld,
        input.campaignId,
      );
      context.foundation.world = checkpoint.worldSettlement.nextWorld;
    }
    const logic = checkpoint.worldLogic;
    const controlledEntityId =
      claim.source.runtime.configuration?.controlledEntityIds[0] ??
      claim.source.snapshot.entities.find((e) => e.kind === "player")?.id;
    const actorId = logic
      ? String(logic.actorId)
      : context.world.actors.find(
          (a) => a.entityId === controlledEntityId && a.control === "player",
        )?.id;
    if (!actorId) throw new TurnError("validation");
    const actor = context.world.actors.find(
      (a) => a.id === actorId && a.control === "player",
    );
    if (!actor) throw new TurnError("configuration");
    let plan: LoopPlan;
    try {
      const proposal = parseFoundationActionProposal(raw);
      const actionCheck =
        "checkIndex" in proposal
          ? checkpoint.checks.find((c) => c.index === proposal.checkIndex)
          : undefined;
      plan = planFoundationAction(context, command, raw, {
        input: input.input,
        actorId,
        profile: logic ? "world_logic" : "console_basic",
        checks: checkpoint.checks,
        outcome: logic
          ? logic.outcome === "blocked"
            ? "blocked"
            : "completed"
          : actionCheck?.success === false
            ? "blocked"
            : "completed",
        uncertainty:
          logic?.uncertainty === "resolved" || !logic
            ? "resolved"
            : "unsupported",
        capabilities: logic
          ? (logic.capabilityRefs as string[])
          : [...actor.capabilities],
      });
    } catch {
      throw new TurnError("validation", false);
    }
    const result: FoundationTurnSettlement = {
      schemaVersion: 1,
      command,
      proposal: structuredClone(raw),
      worldMinutes: checkpoint.resolution.worldMinutes,
      plan,
    };
    const previous = checkpoint.foundationSettlement;
    if (previous && !isDeepStrictEqual(previous, result))
      throw new TurnError("conflict", false);
    return result;
  };
}
