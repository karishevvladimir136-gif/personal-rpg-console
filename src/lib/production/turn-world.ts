import { readWorldFoundation } from "../server/world/store.ts";
import {
  stageWorldTransition,
  validateWorldSettlement,
} from "../world/stage.ts";
import { TurnError } from "../gameplay/turn-errors.ts";
import type { FoundationRpc } from "./contracts.ts";
import type { PrepareWorld } from "./turn-contract.ts";

/** The only world/turn bridge. No private state is added to RuntimeSource. */
export function worldTurnPreparer(rpc: FoundationRpc): PrepareWorld {
  return async (claim, resolution, previous) => {
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
    // Replayed resolution excludes previously appended public world observations.
    const base = {
      ...resolution,
      outcomes: resolution.outcomes.filter(
        (row) => row.kind !== "world.observed",
      ),
    };
    const stageInput = {
      snapshot,
      command,
      source: claim.source,
      resolution: base,
      trigger:
        base.worldMinutes > snapshot.worldMinutes
          ? ("time_skip" as const)
          : base.changes.length
            ? ("state_change" as const)
            : ("action" as const),
    };
    const result = stageWorldTransition(stageInput);
    if (result.status === "paused") throw new TurnError("configuration", false);
    if (result.status === "noop") {
      if (previous) throw new TurnError("conflict");
      return null;
    }
    if (previous) validateWorldSettlement(stageInput, previous);
    const saved = await rpc({
      p_owner_id: claim.source.ownerId,
      p_campaign_id: input.campaignId,
      p_action: "stage",
      p_payload: { command, settlement: result.settlement },
      p_timeline: timeline,
    });
    if (saved.error)
      throw new TurnError(
        saved.error.message?.includes("rpg_conflict")
          ? "conflict"
          : "validation",
      );
    validateWorldSettlement(stageInput, saved.data);
    return {
      settlement: result.settlement,
      resolution: {
        ...base,
        outcomes: [
          ...base.outcomes,
          ...result.publicEvents.map((event) => ({
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
