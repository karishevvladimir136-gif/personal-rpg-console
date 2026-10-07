import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { TimelineFence } from "../saves/contracts.ts";
import { isTimelineFence } from "../saves/fence.ts";
import { isUuid } from "../persistence/validation.ts";
import type {
  MapLayout, MapPlacement, MapPlacementCommand,
} from "../map/placement-contracts.ts";
import { parseMapPlacementCommand } from "../map/placement-contracts.ts";
import { authorizeCampaign } from "./campaign-authorization.ts";
import { createSaveStore } from "./saves/store.ts";
import { databaseError, PersistenceError } from "./errors.ts";

function serviceClient(ownerId: string) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key || process.env.RPG_OWNER_USER_ID !== ownerId)
    throw new PersistenceError("not_configured");
  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

/** Authoritative filtered read at an exact active timeline fence. */
export async function readMapPlacementsForSnapshot(
  ownerId: string,
  campaignId: string,
  timeline: TimelineFence,
): Promise<MapPlacement[]> {
  if (!isUuid(ownerId) || !isUuid(campaignId) || !isTimelineFence(timeline))
    throw new PersistenceError("validation");
  const result = await serviceClient(ownerId).rpc("rpg_map_layout", {
    p_owner_id: ownerId,
    p_campaign_id: campaignId,
    p_action: "read",
    p_payload: {},
    p_timeline: timeline,
  });
  if (result.error) throw databaseError(result.error);
  const data = result.data as MapLayout | null;
  if (!data || !isTimelineFence(data.timeline) ||
      data.timeline.timelineId !== timeline.timelineId ||
      data.timeline.epoch !== timeline.epoch || !Array.isArray(data.placements))
    throw new PersistenceError("unavailable");
  return data.placements;
}

export async function readMapLayout(campaignId: string): Promise<MapLayout> {
  const { user } = await authorizeCampaign(campaignId);
  const timeline = await createSaveStore(user.id).fence(campaignId);
  return {
    timeline,
    placements: await readMapPlacementsForSnapshot(user.id, campaignId, timeline),
  };
}

export async function writeMapPlacement(campaignId: string, value: unknown) {
  const { user } = await authorizeCampaign(campaignId);
  const command: MapPlacementCommand | null = parseMapPlacementCommand(value);
  if (!command) throw new PersistenceError("validation");
  const { timeline, ...payload } = command;
  const result = await serviceClient(user.id).rpc("rpg_map_layout", {
    p_owner_id: user.id,
    p_campaign_id: campaignId,
    p_action: "save",
    p_payload: payload,
    p_timeline: timeline,
  });
  if (result.error) throw databaseError(result.error);
  const data = result.data as { placement?: MapPlacement } | null;
  if (!data?.placement || data.placement.campaign_id !== campaignId ||
      data.placement.location_id !== command.locationId)
    throw new PersistenceError("unavailable");
  return { placement: data.placement };
}
