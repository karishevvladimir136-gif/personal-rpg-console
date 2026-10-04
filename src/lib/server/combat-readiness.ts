import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { CombatReadinessConfirmation, CombatReadinessProposal } from "../gameplay/combat-readiness.ts";
import { authorizeCampaign } from "./campaign-authorization";
import { databaseError, PersistenceError } from "./errors";

export async function combatReadiness(
  campaignId: string,
  action: "inspect" | "confirm",
  payload: CombatReadinessConfirmation | Record<string, never>,
): Promise<CombatReadinessProposal | { campaignId: string; requestId: string; ready: true }> {
  const { user } = await authorizeCampaign(campaignId);
  if (user.id !== process.env.RPG_OWNER_USER_ID)
    throw new PersistenceError("forbidden");
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new PersistenceError("not_configured");
  const client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  const result = await client.rpc("rpg_combat_readiness", {
    p_owner_id: user.id,
    p_campaign_id: campaignId,
    p_action: action,
    p_payload: payload,
  });
  if (result.error) throw databaseError(result.error);
  if (!result.data || typeof result.data !== "object")
    throw new PersistenceError("unavailable");
  return result.data as CombatReadinessProposal;
}
