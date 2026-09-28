import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Mutation, MutationResult } from "../persistence/contracts";
import { isUuid } from "../persistence/validation";
import { isTimelineFence, sameTimeline } from "../saves/fence";
import { databaseError, PersistenceError } from "./errors";

// Only the authorized, typed FRAME authority calls this service-only route.
// The client Mutation cannot choose a non-factual correction mode.
export async function applyFrameLifecycleMutation(
  ownerId: string,
  input: Mutation,
): Promise<MutationResult> {
  const url = process.env.SUPABASE_URL,
    key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (
    !url ||
    !key ||
    !isUuid(ownerId) ||
    ownerId !== process.env.RPG_OWNER_USER_ID
  )
    throw new PersistenceError("not_configured");
  if (input.operation !== "document.save" || !isTimelineFence(input.timeline))
    throw new PersistenceError("validation");
  const client = createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
  const response = await client.rpc("rpg_frame_lifecycle", {
    p_owner_id: ownerId,
    p_mutation: input,
  });
  if (response.error) throw databaseError(response.error);
  const result = response.data as MutationResult | null;
  if (
    !result ||
    !isUuid(result.id) ||
    !Number.isSafeInteger(result.revision) ||
    result.revision < 1 ||
    result.campaign_id !== input.campaignId ||
    !isTimelineFence(result.timeline) ||
    !sameTimeline(result.timeline, input.timeline)
  )
    throw new PersistenceError("unavailable");
  return {
    id: result.id,
    revision: result.revision,
    campaign_id: result.campaign_id,
    timeline: result.timeline,
  };
}
