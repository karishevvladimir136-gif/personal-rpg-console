import type {
  FoundationRpc,
  FoundationSnapshot,
} from "../../production/contracts.ts";
import type { TimelineFence } from "../../saves/contracts.ts";
import { validateFoundationSnapshot } from "../../world/stage.ts";
import {
  array,
  minute,
  object,
  requireWorld,
  uuid,
} from "../../world/validation.ts";

export type LocalWorldRoute = { actorId: string; destinationId: string };

/** Inject a server-authorized rpg_world RPC. Pure adapter for offline tests.
 * Never export FoundationSnapshot through an ordinary client route. No-op reads
 * perform no writes; authorization and current fence are rechecked in SQL. */
export async function readWorldFoundation(
  rpc: FoundationRpc,
  ownerId: string,
  campaignId: string,
  timeline: TimelineFence,
): Promise<FoundationSnapshot> {
  uuid(ownerId);
  uuid(campaignId);
  object(timeline, ["timelineId", "epoch"]);
  uuid(timeline.timelineId);
  minute(timeline.epoch);
  const response = await rpc({
    p_owner_id: ownerId,
    p_campaign_id: campaignId,
    p_action: "read",
    p_payload: {},
    p_timeline: timeline,
  });
  requireWorld(!response.error, "stale_world");
  const snapshot = response.data as FoundationSnapshot;
  validateFoundationSnapshot(snapshot);
  requireWorld(
    snapshot.ownerId === ownerId &&
      snapshot.campaignId === campaignId &&
      snapshot.timeline.timelineId === timeline.timelineId &&
      snapshot.timeline.epoch === timeline.epoch,
    "stale_world",
  );
  return structuredClone(snapshot);
}

/** Server-only route projection. Older fixture databases have no such action. */
export async function readWorldFoundationWithLocalRoutes(
  rpc: FoundationRpc,
  ownerId: string,
  campaignId: string,
  timeline: TimelineFence,
): Promise<{ snapshot: FoundationSnapshot; localRoutes: LocalWorldRoute[] }> {
  const snapshot = await readWorldFoundation(
    rpc,
    ownerId,
    campaignId,
    timeline,
  );
  let rawRoutes: unknown;
  try {
    const response = await rpc({
      p_owner_id: ownerId,
      p_campaign_id: campaignId,
      p_action: "local_routes",
      p_payload: {},
      p_timeline: timeline,
    });
    if (response.error) {
      // Pre-migration World RPCs reject this optional read action. A missing
      // projection grants no route; SQL still owns final travel authority.
      return { snapshot, localRoutes: [] };
    }
    rawRoutes = response.data;
  } catch {
    return { snapshot, localRoutes: [] };
  }
  const localRoutes = array(rawRoutes, 512).map((raw) => {
    const route = object(raw, ["actorId", "destinationId"]);
    uuid(route.actorId);
    uuid(route.destinationId);
    return {
      actorId: route.actorId as string,
      destinationId: route.destinationId as string,
    };
  });
  requireWorld(
    new Set(
      localRoutes.map((route) => `${route.actorId}:${route.destinationId}`),
    ).size === localRoutes.length,
  );
  return { snapshot, localRoutes };
}
