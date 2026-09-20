import type {
  FoundationRpc,
  FoundationSnapshot,
} from "../../production/contracts.ts";
import type { TimelineFence } from "../../saves/contracts.ts";
import { validateFoundationSnapshot } from "../../world/stage.ts";
import { minute, object, requireWorld, uuid } from "../../world/validation.ts";

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
