import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { TimelineFence } from "../saves/contracts.ts";
import { DmError } from "../gameplay/dm-errors.ts";
import { authorizeCampaign } from "./campaign-authorization";

// Migration 43 checks the exact playable fence and opening receipt/event.
// Neither a manually edited Location nor a merely started Adventure proves
// that the owner approved the campaign's opening.
export async function readAstraFirstOpeningStatus(
  campaignId: string,
  timeline: TimelineFence,
): Promise<boolean> {
  const { user } = await authorizeCampaign(campaignId);
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new DmError("configuration");
  const client = createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
  const result = await client.rpc("rpg_bootstrap", {
    p_owner_id: user.id,
    p_campaign_id: campaignId,
    p_action: "astra_first_status",
    p_payload: { timeline },
  });
  if (result.error)
    throw new DmError(
      result.error.message?.includes("rpg_conflict")
        ? "conflict"
        : "unavailable",
      true,
    );
  if (typeof result.data?.approvedOpening !== "boolean")
    throw new DmError("unavailable", true);
  return result.data.approvedOpening;
}
